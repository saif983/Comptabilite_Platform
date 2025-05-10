import fitz  # PyMuPDF
import psycopg2
import re
import os
import sys
import traceback
from datetime import datetime
from tkinter import Tk, filedialog
import io

# Encodage de la sortie en UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

# === Configuration et journalisation ===
DEBUG = True

def log(message, error=False):
    """Écrire un message de log dans stderr ou stdout"""
    if error:
        print(f"❌ ERREUR: {message}", file=sys.stderr)
    elif DEBUG:
        print(f"ℹ️ DEBUG: {message}", file=sys.stdout)
    else:
        print(message, file=sys.stdout)

# === Fonctions utilitaires ===

def choisir_pdf():
    root = Tk()
    root.withdraw()
    return filedialog.askopenfilename(title="Sélectionner une facture PDF", filetypes=[("Fichiers PDF", "*.pdf")])

def extract_text_from_pdf(pdf_path):
    try:
        with fitz.open(pdf_path) as doc:
            text = "".join(page.get_text() for page in doc)
            log(f"Texte extrait du PDF: {len(text)} caractères")
            return text
    except Exception as e:
        log(f"Erreur lors de l'extraction du texte du PDF: {e}", error=True)
        raise

def extract_invoice_data(text):
    log("Début de l'extraction des données de la facture")
    
    # Recherche du numéro et de la date
    numero_date = re.search(r"Facture n°(\d+)\s*-\s*(\d{2}/\d{2}/\d{4})", text)
    numero = numero_date.group(1) if numero_date else None
    date_facture = None
    if numero_date and numero_date.group(2):
        try:
            date_facture = datetime.strptime(numero_date.group(2), "%d/%m/%Y").date()
        except Exception as e:
            log(f"Erreur lors de la conversion de la date: {e}", error=True)
    
    log(f"Numéro de facture: {numero}, Date: {date_facture}")

    # Informations client
    client = re.search(r"Client\s*:\s*(.+)", text)
    client_nom = client.group(1).strip() if client else None
    
    adresse = re.search(r"Adresse\s*:\s*(.+)", text)
    adresse_client = adresse.group(1).strip() if adresse else None
    
    telephone = re.search(r"Tel\s*:\s*(\d+)", text)
    tel_client = telephone.group(1).strip() if telephone else None
    
    log(f"Client: {client_nom}, Adresse: {adresse_client}, Téléphone: {tel_client}")

    # Montants
    ttc = re.search(r"Total TTC\s*(\d+[.,]\d+)", text)
    ht = re.search(r"Total HT\s*(\d+[.,]\d+)", text)
    
    montant_ttc = None
    montant_ht = None
    
    if ttc:
        try:
            montant_ttc = float(ttc.group(1).replace(",", "."))
            log(f"Montant TTC extrait: {montant_ttc}")
        except Exception as e:
            log(f"Erreur lors de la conversion du montant TTC: {e}", error=True)
            montant_ttc = 0
    
    if ht:
        try:
            montant_ht = float(ht.group(1).replace(",", "."))
            log(f"Montant HT extrait: {montant_ht}")
        except Exception as e:
            log(f"Erreur lors de la conversion du montant HT: {e}", error=True)
            montant_ht = 0
    
    # Extraction des lignes de produits
    lignes_produits = []
    pattern = re.compile(r"([A-Za-z_ ]+)\s+(\d+)\s+(\d+[.,]\d+)\s+(\d+)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)")
    
    for match in pattern.finditer(text):
        try:
            produit, qty, price, tva, ht_ligne, ttc_ligne = match.groups()
            
            # Conversion sécurisée
            qty_int = int(qty)
            ht_float = float(ht_ligne.replace(",", "."))
            ttc_float = float(ttc_ligne.replace(",", "."))
            
            lignes_produits.append({
                'NomProduit': produit.strip(),
                'Quantite': qty_int,
                'HT': ht_float,
                'TTC': ttc_float
            })
            log(f"Ligne produit extraite: {produit.strip()}, Qté: {qty_int}, HT: {ht_float}, TTC: {ttc_float}")
        except Exception as e:
            log(f"Erreur lors de l'extraction d'une ligne de produit: {e}", error=True)

    return {
        "numero": numero,
        "date": date_facture,
        "client": client_nom,
        "adresse": adresse_client,
        "telephone": tel_client,
        "montant_ht": montant_ht,
        "montant_ttc": montant_ttc,
        "lignes": lignes_produits
    }

# === Fonctions base de données ===

def get_connection():
    """Établir une connexion à la base de données avec gestion d'erreur"""
    try:
        conn = psycopg2.connect(
            dbname="Comptabilite",
            user="postgres",
            password="06122003",
            host="localhost",
            port="5432"
        )
        log("Connexion à la base de données réussie")
        return conn
    except Exception as e:
        log(f"Erreur de connexion à la base de données: {e}", error=True)
        raise

def insert_produit_service_if_not_exists(conn, nom_produit, prix_unitaire, tva, entreprise_id, utilisateur_id):
    try:
        log(f"Vérification du produit '{nom_produit}' - Prix: {prix_unitaire}, TVA: {tva}")
        with conn.cursor() as cur:
            # Vérifier si le produit existe déjà
            cur.execute('SELECT "Id" FROM "ProduitServices" WHERE LOWER("Nom") = LOWER(%s)', (nom_produit,))
            result = cur.fetchone()
            if result:
                log(f"Produit existant trouvé: {nom_produit} (ID: {result[0]})")
                return result[0]  # Retourner l'ID existant
            
            # Sinon, l'insérer
            log(f"Insertion d'un nouveau produit: {nom_produit}, Prix: {prix_unitaire}, TVA: {tva}")
            
            # Vérifier les valeurs numériques
            if not isinstance(prix_unitaire, (int, float)) or prix_unitaire < 0:
                log(f"⚠️ Prix unitaire invalide: {prix_unitaire}, correction à 0", error=True)
                prix_unitaire = 0
                
            if not isinstance(tva, (int, float)) or tva < 0:
                log(f"⚠️ TVA invalide: {tva}, correction à 0", error=True)
                tva = 0
                
            cur.execute("""
                INSERT INTO "ProduitServices" ("Nom", "PrixUnitaire", "TVA", "EntrepriseId", "UtilisateurId")
                VALUES (%s, %s, %s, %s, %s)
                RETURNING "Id"
            """, (nom_produit, prix_unitaire, tva, entreprise_id, utilisateur_id))
            new_id = cur.fetchone()[0]
            log(f"Nouveau produit créé avec ID: {new_id}")
            return new_id
    except Exception as e:
        log(f"Erreur lors de l'insertion du produit '{nom_produit}': {e}", error=True)
        log(traceback.format_exc(), error=True)
        raise

def get_default_entreprise_id(conn, utilisateur_id):
    try:
        # D'abord, vérifier si l'ID est disponible dans les variables d'environnement
        default_entreprise_id = os.environ.get("DEFAULT_ENTREPRISE_ID")
        if default_entreprise_id and default_entreprise_id.isdigit():
            log(f"ID de l'entreprise par défaut trouvé dans les variables d'environnement: {default_entreprise_id}")
            return int(default_entreprise_id)
        
        log("ID de l'entreprise par défaut non trouvé dans les variables d'environnement, recherche en base de données...")
        # Sinon, chercher en base de données
        with conn.cursor() as cur:
            cur.execute('SELECT "DefaultEntrepriseId" FROM "Utilisateurs" WHERE "Id" = %s', (utilisateur_id,))
            result = cur.fetchone()
            if result and result[0]:
                log(f"Entreprise par défaut trouvée: {result[0]}")
                return result[0]
            else:
                log("Aucune entreprise par défaut trouvée", error=True)
                raise Exception("⚠️ Aucun DefaultEntrepriseId trouvé pour cet utilisateur.")
    except Exception as e:
        log(f"Erreur lors de la récupération de l'entreprise par défaut: {e}", error=True)
        log(traceback.format_exc(), error=True)
        raise

def get_compte_bancaire_id(conn, utilisateur_id):
    try:
        # D'abord, vérifier si l'ID est disponible dans les variables d'environnement
        compte_id = os.environ.get("COMPTE_BANCAIRE_ID")
        if compte_id and compte_id.isdigit():
            log(f"ID du compte bancaire trouvé dans les variables d'environnement: {compte_id}")
            return int(compte_id)
        
        log("ID du compte bancaire non trouvé dans les variables d'environnement, recherche en base de données...")
        # Sinon, chercher en base de données
        with conn.cursor() as cur:
            # Requête simplifiée qui évite de récupérer les champs Solde
            cur.execute('SELECT "Id" FROM "ComptesBancaires" WHERE "UtilisateurId" = %s LIMIT 1', (utilisateur_id,))
            result = cur.fetchone()
            if result:
                log(f"Compte bancaire trouvé: {result[0]}")
                return result[0]
            else:
                log("Aucun compte bancaire trouvé", error=True)
                raise Exception("⚠️ Aucun compte bancaire trouvé pour cet utilisateur.")
    except Exception as e:
        log(f"Erreur lors de la récupération du compte bancaire: {e}", error=True)
        log(traceback.format_exc(), error=True)
        raise

def insert_invoice(data, utilisateur_id, mode_paiement):
    log(f"Début de l'insertion de la facture pour l'utilisateur {utilisateur_id}")
    conn = None
    try:
        conn = get_connection()
        
        with conn:  # Utiliser un bloc with pour garantir la gestion des transactions
            with conn.cursor() as cur:
                # Récupérer l'ID d'entreprise par défaut
                entreprise_id = get_default_entreprise_id(conn, utilisateur_id)
                log(f"Entreprise ID: {entreprise_id}")
                
                # Récupérer l'ID du compte bancaire
                compte_id = get_compte_bancaire_id(conn, utilisateur_id)
                log(f"Compte bancaire ID: {compte_id}")
                
                # Sécuriser les valeurs numériques
                montant_ttc = data.get('montant_ttc', 0) or 0
                montant_ht = data.get('montant_ht', 0) or 0
                
                # S'assurer que les valeurs sont des nombres
                if not isinstance(montant_ttc, (int, float)):
                    montant_ttc = 0
                if not isinstance(montant_ht, (int, float)):
                    montant_ht = 0
                
                log(f"Montant TTC: {montant_ttc}, Montant HT: {montant_ht}")
                
                # Créer la facture
                log("Création de la facture...")
                cur.execute("""
                    INSERT INTO "Factures" (
                        "NumFacture", "Date", "EstPayee", "EntrepriseId",
                        "MontantTotal", "THT", "UtilisateurId",
                        "NomClient", "TelClient", "AdressClient"
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING "Id"
                """, (
                    data['numero'] or "AUTO", 
                    data['date'] or datetime.now().date(), 
                    True, 
                    entreprise_id,
                    montant_ttc, 
                    montant_ht, 
                    utilisateur_id,
                    data['client'] or "Client importé", 
                    data['telephone'] or "", 
                    data['adresse'] or ""
                ))
                facture_id = cur.fetchone()[0]
                log(f"Facture créée avec ID: {facture_id}")
                
                # Insérer les détails de la facture
                log("Insertion des détails de la facture...")
                for i, ligne in enumerate(data.get('lignes', [])):
                    try:
                        # Conversion sécurisée
                        ht = float(ligne.get('HT', 0) or 0)
                        ttc = float(ligne.get('TTC', 0) or 0)
                        quantite = int(ligne.get('Quantite', 1) or 1)
                        
                        log(f"Ligne {i+1} - Valeurs brutes: HT={ligne.get('HT')}, TTC={ligne.get('TTC')}, Quantité={ligne.get('Quantite')}")
                        log(f"Ligne {i+1} - Valeurs converties: HT={ht}, TTC={ttc}, Quantité={quantite}")
                        
                        # Calcul du prix unitaire et TVA
                        prix_unitaire = ht / quantite if quantite > 0 else 0
                        tva = ((ttc - ht) * 100 / ht) if ht > 0 else 0
                        
                        log(f"Ligne {i+1} - Valeurs calculées: Prix unitaire={prix_unitaire}, TVA={tva}")
                        
                        # Insertion du produit
                        nom_produit = ligne.get('NomProduit', f"Produit importé {i+1}") or f"Produit importé {i+1}"
                        produit_id = insert_produit_service_if_not_exists(
                            conn,
                            nom_produit=nom_produit,
                            prix_unitaire=prix_unitaire,
                            tva=tva,
                            entreprise_id=entreprise_id,
                            utilisateur_id=utilisateur_id
                        )
                        
                        # Validation des valeurs avant insertion
                        if ht < 0:
                            log(f"⚠️ Correction d'une valeur HT négative: {ht} → 0", error=True)
                            ht = 0
                        
                        if ttc < 0:
                            log(f"⚠️ Correction d'une valeur TTC négative: {ttc} → 0", error=True)
                            ttc = 0
                        
                        # Insertion du détail de facture
                        log(f"Insertion du détail de facture - FactureId: {facture_id}, ProduitId: {produit_id}, Quantité: {quantite}, HT: {ht}, TTC: {ttc}")
                        cur.execute("""
                            INSERT INTO "FactureDetails" ("FactureId", "ProduitServiceId", "Quantite", "TTC", "HT")
                            VALUES (%s, %s, %s, %s, %s)
                        """, (facture_id, produit_id, quantite, ttc, ht))
                        
                        log(f"Détail de facture ajouté: Produit {nom_produit}, Quantité {quantite}, HT {ht}, TTC {ttc}")
                        
                        # Vérification de l'insertion
                        cur.execute('SELECT "Id", "TTC", "HT" FROM "FactureDetails" WHERE "FactureId" = %s AND "ProduitServiceId" = %s ORDER BY "Id" DESC LIMIT 1', 
                                   (facture_id, produit_id))
                        detail_result = cur.fetchone()
                        if detail_result:
                            detail_id, detail_ttc, detail_ht = detail_result
                            log(f"Vérification du détail inséré - ID: {detail_id}, TTC: {detail_ttc}, HT: {detail_ht}")
                        else:
                            log("⚠️ Impossible de vérifier le détail inséré.", error=True)
                        
                    except Exception as e:
                        log(f"Erreur lors de l'insertion du détail de facture: {e}", error=True)
                        log(traceback.format_exc(), error=True)
                
                # Créer le paiement
                log("Création du paiement...")
                try:
                    cur.execute("""
                        INSERT INTO "Paiements" (
                            "FactureId", "Montant", "DatePaiement", "ModePaiement",
                            "Type", "Description", "UtilisateurId", "CompteBancaireId"
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        facture_id, 
                        montant_ttc, 
                        datetime.now().date(),
                        mode_paiement, 
                        0, 
                        f"Facture numéro {data['numero']} payée",
                        utilisateur_id, 
                        compte_id
                    ))
                    log("Paiement créé avec succès")
                except Exception as e:
                    log(f"Erreur lors de la création du paiement: {e}", error=True)
                    log(traceback.format_exc(), error=True)
                
                # Mettre à jour le solde du compte avec une requête SQL directe
                log("Mise à jour du solde du compte bancaire...")
                try:
                    cur.execute("""
                        UPDATE "ComptesBancaires"
                        SET "Solde" = "Solde" + %s
                        WHERE "Id" = %s
                    """, (montant_ttc, compte_id))
                    log(f"Solde du compte bancaire {compte_id} mis à jour: +{montant_ttc}")
                except Exception as e:
                    log(f"⚠️ Erreur lors de la mise à jour du solde: {e}", error=True)
                    log(traceback.format_exc(), error=True)
            
            # Le commit est automatique avec le bloc with pour conn
            log("✅ Facture, détails et paiement insérés avec succès.")
            return True
    except Exception as e:
        log(f"❌ Erreur lors de l'insertion de la facture: {e}", error=True)
        log(traceback.format_exc(), error=True)
        if conn:
            try:
                conn.rollback()
                log("Transaction annulée")
            except:
                log("Impossible d'annuler la transaction", error=True)
        return False
    finally:
        if conn:
            try:
                conn.close()
                log("Connexion à la base de données fermée")
            except:
                log("Erreur lors de la fermeture de la connexion", error=True)

# === Main ===

if __name__ == "__main__":
    try:
        log("Démarrage du script d'importation de facture")
        
        # Récupération des paramètres
        utilisateur_id_str = os.environ.get("UTILISATEUR_ID")
        compte_bancaire_id = os.environ.get("COMPTE_BANCAIRE_ID")
        default_entreprise_id = os.environ.get("DEFAULT_ENTREPRISE_ID")
        
        log(f"Variables d'environnement - UTILISATEUR_ID: {utilisateur_id_str}, COMPTE_BANCAIRE_ID: {compte_bancaire_id}, DEFAULT_ENTREPRISE_ID: {default_entreprise_id}")
        
        if utilisateur_id_str is None:
            # Mode interactif
            log("Mode interactif activé")
            chemin_pdf = choisir_pdf()
            if chemin_pdf:
                log(f"Fichier PDF sélectionné: {chemin_pdf}")
                texte = extract_text_from_pdf(chemin_pdf)
                donnees = extract_invoice_data(texte)
                
                if all([donnees.get(k) for k in ['numero', 'date', 'client', 'montant_ttc']]):
                    while True:
                        saisie = input("🛠️ Saisir UtilisateurId : ").strip()
                        if saisie.isdigit():
                            utilisateur_id = int(saisie)
                            break
                        else:
                            log("❗ Veuillez saisir un entier valide pour l'UtilisateurId.", error=True)
                    
                    mode_paiement = input("💳 Saisir le mode de paiement (ex: Espèces, Bancaire) : ")
                    insert_invoice(donnees, utilisateur_id, mode_paiement)
                else:
                    missing = [k for k in ['numero', 'date', 'client', 'montant_ttc'] if not donnees.get(k)]
                    log(f"❗ Données incomplètes. Champs manquants: {', '.join(missing)}", error=True)
                    log(f"Données extraites: {donnees}", error=True)
            else:
                log("🚫 Aucun fichier sélectionné.", error=True)
        else:
            # Mode automatique
            log("Mode automatique activé")
            try:
                utilisateur_id = int(utilisateur_id_str)
                log(f"Utilisateur ID: {utilisateur_id}")
                
                if len(sys.argv) < 2:
                    log("❌ Chemin du fichier PDF manquant", error=True)
                    sys.exit(1)
                
                chemin_pdf = sys.argv[1]
                log(f"Chemin du PDF: {chemin_pdf}")
                
                texte = extract_text_from_pdf(chemin_pdf)
                log(f"Extraction du texte réussie: {len(texte)} caractères")
                
                donnees = extract_invoice_data(texte)
                log(f"Données extraites: {donnees}")
                
                if all([donnees.get(k) for k in ['numero', 'date', 'client', 'montant_ttc']]):
                    mode_paiement = "Bancaire"
                    log("Insertion de la facture...")
                    success = insert_invoice(donnees, utilisateur_id, mode_paiement)
                    if not success:
                        log("Échec de l'insertion de la facture", error=True)
                        sys.exit(1)
                    log("Importation terminée avec succès")
                else:
                    missing = [k for k in ['numero', 'date', 'client', 'montant_ttc'] if not donnees.get(k)]
                    log(f"❗ Données incomplètes dans le PDF. Champs manquants: {', '.join(missing)}", error=True)
                    sys.exit(1)
            except Exception as e:
                log(f"❌ Erreur critique: {e}", error=True)
                log(traceback.format_exc(), error=True)
                sys.exit(1)
    except Exception as e:
        log(f"❌ Exception non gérée: {e}", error=True)
        log(traceback.format_exc(), error=True)
        sys.exit(1)
