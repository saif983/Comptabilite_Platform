import fitz
import psycopg2
import re
from datetime import datetime
from tkinter import Tk, filedialog

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

def get_produit_service_id(conn, nom_produit):
    with conn.cursor() as cur:
        cur.execute('SELECT "Id" FROM "ProduitServices" WHERE LOWER("Nom") = LOWER(%s)', (nom_produit,))
        result = cur.fetchone()
        if result:
            return result[0]
        else:
            raise Exception(f"ProduitService non trouvé : {nom_produit}")

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
    mode_paiement = "Null"
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

        # Ajout de l'adresse et du téléphone à l'insertion de la facture
        cur.execute("""
            INSERT INTO "Factures" (
                "NumFacture", "Date", "EstPayee", "EntrepriseId",
                "MontantTotal", "THT", "UtilisateurId",
                "NomClient", "TelClient"
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s,%s, %s)
            RETURNING "Id"
        """, (
            data['numero'], data['date'], True, entreprise_id,
            data['montant_ttc'], data['montant_ht'], utilisateur_id,
            data['client'], data['telephone']
        ))
        facture_id = cur.fetchone()[0]

        for ligne in data['lignes']:
            produit_id = get_produit_service_id(conn, ligne['NomProduit'])
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

        conn.commit()
        cur.close()
        conn.close()
        print("✅ Facture, détails et paiement insérés avec succès.")
    except Exception as e:
        print("❌ Erreur :", e)

if __name__ == "__main__":
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
