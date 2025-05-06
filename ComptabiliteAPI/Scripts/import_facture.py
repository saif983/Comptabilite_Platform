import fitz  # PyMuPDF
import psycopg2
import re
import os
import sys
from datetime import datetime
from tkinter import Tk, filedialog
import io

# Encodage de la sortie en UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

# === Fonctions utilitaires ===

def choisir_pdf():
    root = Tk()
    root.withdraw()
    return filedialog.askopenfilename(title="Sélectionner une facture PDF", filetypes=[("Fichiers PDF", "*.pdf")])

def extract_text_from_pdf(pdf_path):
    with fitz.open(pdf_path) as doc:
        return "".join(page.get_text() for page in doc)

def extract_invoice_data(text):
    numero_date = re.search(r"Facture n°(\d+)\s*-\s*(\d{2}/\d{2}/\d{4})", text)
    numero = numero_date.group(1) if numero_date else None
    date_facture = datetime.strptime(numero_date.group(2), "%d/%m/%Y").date() if numero_date else None

    client = re.search(r"Client\s*:\s*(.+)", text)
    client_nom = client.group(1).strip() if client else None

    adresse = re.search(r"Adresse\s*:\s*(.+)", text)
    adresse_client = adresse.group(1).strip() if adresse else None

    telephone = re.search(r"Tel\s*:\s*(\d+)", text)
    tel_client = telephone.group(1).strip() if telephone else None

    ttc = re.search(r"Total TTC\s*(\d+,\d+)", text)
    ht = re.search(r"Total HT\s*(\d+,\d+)", text)

    montant_ttc = float(ttc.group(1).replace(",", ".")) if ttc else None
    montant_ht = float(ht.group(1).replace(",", ".")) if ht else None

    lignes_produits = []
    pattern = re.compile(r"([A-Za-z_ ]+)\s+(\d+)\s+(\d+,\d+)\s+(\d+)\s+(\d+,\d+)\s+(\d+,\d+)")
    for match in pattern.finditer(text):
        produit, qty, price, tva, ht_ligne, ttc_ligne = match.groups()
        lignes_produits.append({
            'NomProduit': produit.strip(),
            'Quantite': int(qty),
            'HT': float(ht_ligne.replace(",", ".")),
            'TTC': float(ttc_ligne.replace(",", "."))
        })

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

def insert_produit_service_if_not_exists(conn, nom_produit, prix_unitaire, tva, entreprise_id, utilisateur_id):
    with conn.cursor() as cur:
        # Vérifier si le produit existe déjà
        cur.execute('SELECT "Id" FROM "ProduitServices" WHERE LOWER("Nom") = LOWER(%s)', (nom_produit,))
        result = cur.fetchone()
        if result:
            return result[0]  # Retourner l'ID existant
        # Sinon, l'insérer
        cur.execute("""
            INSERT INTO "ProduitServices" ("Nom", "PrixUnitaire", "TVA", "EntrepriseId", "UtilisateurId")
            VALUES (%s, %s, %s, %s, %s)
            RETURNING "Id"
        """, (nom_produit, prix_unitaire, tva, entreprise_id, utilisateur_id))
        return cur.fetchone()[0]


def get_default_entreprise_id(conn, utilisateur_id):
    with conn.cursor() as cur:
        cur.execute('SELECT "DefaultEntrepriseId" FROM "Utilisateurs" WHERE "Id" = %s', (utilisateur_id,))
        result = cur.fetchone()
        if result and result[0]:
            return result[0]
        else:
            raise Exception("⚠️ Aucun DefaultEntrepriseId trouvé pour cet utilisateur.")

def get_compte_bancaire_id(conn, utilisateur_id):
    with conn.cursor() as cur:
        cur.execute('SELECT "Id" FROM "ComptesBancaires" WHERE "UtilisateurId" = %s LIMIT 1', (utilisateur_id,))
        result = cur.fetchone()
        if result:
            return result[0]
        else:
            raise Exception("⚠️ Aucun compte bancaire trouvé pour cet utilisateur.")

def insert_invoice(data, utilisateur_id, mode_paiement):
    try:
        conn = psycopg2.connect(
            dbname="Comptabilite",
            user="postgres",
            password="06122003",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()

        entreprise_id = get_default_entreprise_id(conn, utilisateur_id)
        compte_id = get_compte_bancaire_id(conn, utilisateur_id)

        cur.execute("""
            INSERT INTO "Factures" (
                "NumFacture", "Date", "EstPayee", "EntrepriseId",
                "MontantTotal", "THT", "UtilisateurId",
                "NomClient", "TelClient", "AdressClient"
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING "Id"
        """, (
            data['numero'], data['date'], True, entreprise_id,
            data['montant_ttc'], data['montant_ht'], utilisateur_id,
            data['client'], data['telephone'], data['adresse'] or ""
        ))
        facture_id = cur.fetchone()[0]

        for ligne in data['lignes']:
            produit_id = insert_produit_service_if_not_exists(
                conn,
                nom_produit=ligne['NomProduit'],
                prix_unitaire=ligne['HT'] / ligne['Quantite'],  # ou ligne['HT'] si HT est la base
                tva=(ligne['TTC'] - ligne['HT']) * 100 / ligne['HT'],  # TVA calculée en %
                entreprise_id=entreprise_id,
                utilisateur_id=utilisateur_id
            )
            cur.execute("""
                INSERT INTO "FactureDetails" ("FactureId", "ProduitServiceId", "Quantite", "TTC", "HT")
                VALUES (%s, %s, %s, %s, %s)
            """, (facture_id, produit_id, ligne['Quantite'], ligne['TTC'], ligne['HT']))

        cur.execute("""
            INSERT INTO "Paiements" (
                "FactureId", "Montant", "DatePaiement", "ModePaiement",
                "Type", "Description", "UtilisateurId", "CompteBancaireId"
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            facture_id, data['montant_ttc'], datetime.now().date(),
            mode_paiement, 0, f"Facture numéro {data['numero']} payée",
            utilisateur_id, compte_id
        ))
        
        cur.execute("""
        UPDATE "ComptesBancaires"
        SET "Solde" = "Solde" + %s
        WHERE "Id" = %s
            """, (
        data['montant_ttc'], compte_id
            ))

        

        conn.commit()
        cur.close()
        conn.close()
        print("✅ Facture, détails et paiement insérés avec succès.")
        return True

    except Exception as e:
        print("❌ Erreur :", e)
        return False

# === Main ===

if __name__ == "__main__":
    utilisateur_id = os.environ.get("UTILISATEUR_ID")

    if utilisateur_id is None:
        # Mode interactif
        chemin_pdf = choisir_pdf()
        if chemin_pdf:
            texte = extract_text_from_pdf(chemin_pdf)
            donnees = extract_invoice_data(texte)
            if all([donnees[k] for k in ['numero', 'date', 'client', 'montant_ttc']]):
                while True:
                    saisie = input("🛠️ Saisir UtilisateurId : ").strip()
                    if saisie.isdigit():
                        utilisateur_id = int(saisie)
                        break
                    else:
                        print("❗ Veuillez saisir un entier valide pour l'UtilisateurId.")
                mode_paiement = input("💳 Saisir le mode de paiement (ex: Espèces, Bancaire) : ")
                insert_invoice(donnees, utilisateur_id, mode_paiement)
            else:
                print("❗ Données incomplètes :", donnees)
        else:
            print("🚫 Aucun fichier sélectionné.")
    else:
        # Mode automatique
        try:
            utilisateur_id = int(utilisateur_id)
            if len(sys.argv) < 2:
                print("❌ Chemin du fichier PDF manquant")
                sys.exit(1)

            chemin_pdf = sys.argv[1]
            texte = extract_text_from_pdf(chemin_pdf)
            donnees = extract_invoice_data(texte)

            if all([donnees[k] for k in ['numero', 'date', 'client', 'montant_ttc']]):
                mode_paiement = "Bancaire"
                success = insert_invoice(donnees, utilisateur_id, mode_paiement)
                if not success:
                    sys.exit(1)
            else:
                print("❗ Données incomplètes dans le PDF.")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Erreur critique: {e}")
            sys.exit(1)
