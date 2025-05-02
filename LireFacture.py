import fitz
import psycopg2
import re
from datetime import datetime
from tkinter import Tk, filedialog

# 1. Sélectionner un fichier PDF
def choisir_pdf():
    root = Tk()
    root.withdraw()
    return filedialog.askopenfilename(title="Sélectionner une facture PDF", filetypes=[("Fichiers PDF", "*.pdf")])

# 2. Lire le PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    return "".join(page.get_text() for page in doc)

# 3. Extraire données de la facture
def extract_invoice_data(text):
    numero_date = re.search(r"Facture n°(\d+)\s*-\s*(\d{2}/\d{2}/\d{4})", text)
    numero = numero_date.group(1) if numero_date else None
    date_facture = datetime.strptime(numero_date.group(2), "%d/%m/%Y").date() if numero_date else None

    client = re.search(r"Client\s*:\s*(.+)", text)
    client_nom = client.group(1).strip() if client else None

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
        "montant_ht": montant_ht,
        "montant_ttc": montant_ttc,
        "lignes": lignes_produits
    }

# 4. Chercher ProduitServiceId
def get_produit_service_id(conn, nom_produit):
    with conn.cursor() as cur:
        cur.execute("SELECT Id FROM ProduitService WHERE LOWER(Nom) = LOWER(%s)", (nom_produit,))
        result = cur.fetchone()
        if result:
            return result[0]
        else:
            raise Exception(f"ProduitService non trouvé : {nom_produit}")

# 5. Insérer facture + détails + paiement
def insert_invoice(data, entreprise_id, utilisateur_id):
    try:
        conn = psycopg2.connect(
            dbname="Comptabilite",
            user="postgres",
            password="06122003",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()

        # 1. Insérer la facture
        cur.execute("""
            INSERT INTO facture (NumFacture, Date, EstPayee, EntrepriseId, MontantTotal, THT, UtilisateurId)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING Id
        """, (data['numero'], data['date'], True, entreprise_id, data['montant_ttc'], data['montant_ht'], utilisateur_id))
        facture_id = cur.fetchone()[0]

        # 2. Insérer chaque produit dans FactureDetail
        for ligne in data['lignes']:
            produit_id = get_produit_service_id(conn, ligne['NomProduit'])
            cur.execute("""
                INSERT INTO facturedetail (FactureId, ProduitServiceId, Quantite, TTC, HT)
                VALUES (%s, %s, %s, %s, %s)
            """, (facture_id, produit_id, ligne['Quantite'], ligne['TTC'], ligne['HT']))

        # 3. Insérer Paiement automatique
        cur.execute("""
            INSERT INTO paiement (FactureId, Montant, DatePaiement, ModePaiement, Type, Description, UtilisateurId)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (facture_id, data['montant_ttc'], datetime.now().date(), 'Espèces', 'Actif', 'Paiement automatique facture', utilisateur_id))

        conn.commit()
        cur.close()
        conn.close()
        print("✅ Facture + Détails + Paiement enregistrés !")
    except Exception as e:
        print("❌ Erreur :", e)

# 6. Programme principal
if __name__ == "__main__":
    chemin_pdf = choisir_pdf()
    if chemin_pdf:
        texte = extract_text_from_pdf(chemin_pdf)
        donnees = extract_invoice_data(texte)
        if all([donnees[k] for k in ['numero', 'date', 'client', 'montant_ttc']]):
            entreprise_id = int(input("🛠️ Saisir EntrepriseId : "))
            utilisateur_id = int(input("🛠️ Saisir UtilisateurId (ou 0 pour NULL) : "))
            utilisateur_id = utilisateur_id if utilisateur_id != 0 else None
            insert_invoice(donnees, entreprise_id, utilisateur_id)
        else:
            print("❗ Données incomplètes :", donnees)
    else:
        print("🚫 Aucun fichier sélectionné.")
