#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script pour générer un bilan comptable à partir des données de l'entreprise.
Ce script est appelé par l'API pour générer un bilan comptable au format JSON.
"""

import sys
import json
import datetime


class BilanComptable:
    """Classe pour générer un bilan comptable"""

    def __init__(self, entreprise_id, date_bilan=None):
        self.entreprise_id = entreprise_id
        self.date_bilan = date_bilan or datetime.datetime.now().strftime("%Y-%m-%d")

        self.bilan = {
            "entreprise_id": entreprise_id,
            "date": self.date_bilan,
            "actif": {
                "immobilisations": {
                    "incorporelles": 0,
                    "corporelles": 0,
                    "financieres": 0
                },
                "actif_circulant": {
                    "stocks": 0,
                    "creances_clients": 0,
                    "autres_creances": 0,
                    "disponibilites": 0
                }
            },
            "passif": {
                "capitaux_propres": {
                    "capital": 0,
                    "reserves": 0,
                    "resultat": 0
                },
                "dettes": {
                    "emprunts": 0,
                    "dettes_fournisseurs": 0,
                    "dettes_fiscales": 0,
                    "autres_dettes": 0
                }
            }
        }

    def get_safe_float(self, value, default=0):
        """Convertit une valeur en float de manière sécurisée"""
        try:
            if value is None:
                return default
            return float(value)
        except (ValueError, TypeError):
            return default

    def safe_sum(self, items, key, condition=None):
        """Additionne les valeurs d'une liste de manière sécurisée"""
        total = 0
        for item in items:
            if condition is None or condition(item):
                try:
                    value = self.get_safe_float(item.get(key, 0))
                    total += value
                except Exception:
                    # Ignorer les éléments qui causent des erreurs
                    pass
        return total

    def calculer_bilan_depuis_json(self, data_json):
        try:
            data = json.loads(data_json)

            entreprise = data.get("entreprise", {})
            depenses = data.get("depenses", [])
            factures = data.get("factures", [])
            comptes = data.get("comptes_bancaires", [])

            # Immobilisations corporelles (équipement terminé)
            self.bilan["actif"]["immobilisations"]["corporelles"] = self.safe_sum(
                depenses, 
                "montant", 
                lambda d: d.get("categorie") == "Équipement" and d.get("type") == "Terminer"
            )

            # Disponibilités : soldes bancaires
            self.bilan["actif"]["actif_circulant"]["disponibilites"] = self.safe_sum(
                comptes, 
                "solde"
            )

            # Créances clients : factures non payées
            self.bilan["actif"]["actif_circulant"]["creances_clients"] = self.safe_sum(
                factures, 
                "montantTotal", 
                lambda f: f.get("statut") != "Payée"
            )

            # Capital social
            self.bilan["passif"]["capitaux_propres"]["capital"] = self.get_safe_float(
                entreprise.get("capital", 10000)
            )

            # Résultat : recettes - dépenses
            recettes = self.safe_sum(
                factures, 
                "montantTotal", 
                lambda f: f.get("statut") == "Payée"
            )
            depenses_total = self.safe_sum(
                depenses, 
                "montant", 
                lambda d: d.get("type") == "Terminer"
            )
            self.bilan["passif"]["capitaux_propres"]["resultat"] = recettes - depenses_total

            # Dettes fournisseurs : dépenses non terminées
            self.bilan["passif"]["dettes"]["dettes_fournisseurs"] = self.safe_sum(
                depenses, 
                "montant", 
                lambda d: d.get("type") != "Terminer"
            )

            self.calculer_totaux()

            return self.bilan

        except Exception as e:
            print(f"Erreur détaillée: {str(e)}", file=sys.stderr)
            # Ensure totals are calculated even if there's an error
            try:
                self.calculer_totaux()
            except:
                pass
            return {"error": str(e)}

    def calculer_totaux(self):
        try:
            total_immobilisations = sum(self.bilan["actif"]["immobilisations"].values())
            total_actif_circulant = sum(self.bilan["actif"]["actif_circulant"].values())
            total_actif = total_immobilisations + total_actif_circulant

            total_capitaux_propres = sum(self.bilan["passif"]["capitaux_propres"].values())
            total_dettes = sum(self.bilan["passif"]["dettes"].values())
            total_passif = total_capitaux_propres + total_dettes

            self.bilan["actif"]["total_immobilisations"] = total_immobilisations
            self.bilan["actif"]["total_actif_circulant"] = total_actif_circulant
            self.bilan["actif"]["total"] = total_actif

            self.bilan["passif"]["total_capitaux_propres"] = total_capitaux_propres
            self.bilan["passif"]["total_dettes"] = total_dettes
            self.bilan["passif"]["total"] = total_passif

        except Exception as e:
            print(f"Erreur lors du calcul des totaux: {e}", file=sys.stderr)
            # Initialize totals to 0 if calculation fails
            self.bilan["actif"]["total_immobilisations"] = 0
            self.bilan["actif"]["total_actif_circulant"] = 0
            self.bilan["actif"]["total"] = 0
            self.bilan["passif"]["total_capitaux_propres"] = 0
            self.bilan["passif"]["total_dettes"] = 0
            self.bilan["passif"]["total"] = 0

    def generer_bilan_format_simple(self):
        # Ensure totals are calculated before generating the simple format
        self.calculer_totaux()
        
        return {
            "title": f"Bilan au {self.date_bilan}",
            "actif": {
                "immobilisations": [
                    {"label": "Incorporelles", "montant": self.bilan["actif"]["immobilisations"]["incorporelles"]},
                    {"label": "Corporelles", "montant": self.bilan["actif"]["immobilisations"]["corporelles"]},
                    {"label": "Financières", "montant": self.bilan["actif"]["immobilisations"]["financieres"]}
                ],
                "total_immobilisations": self.bilan["actif"]["total_immobilisations"],
                "actif_circulant": [
                    {"label": "Stocks", "montant": self.bilan["actif"]["actif_circulant"]["stocks"]},
                    {"label": "Créances clients", "montant": self.bilan["actif"]["actif_circulant"]["creances_clients"]},
                    {"label": "Autres créances", "montant": self.bilan["actif"]["actif_circulant"]["autres_creances"]},
                    {"label": "Disponibilités", "montant": self.bilan["actif"]["actif_circulant"]["disponibilites"]}
                ],
                "total_actif_circulant": self.bilan["actif"]["total_actif_circulant"],
                "total_actif": self.bilan["actif"]["total"]
            },
            "passif": {
                "capitaux_propres": [
                    {"label": "Capital", "montant": self.bilan["passif"]["capitaux_propres"]["capital"]},
                    {"label": "Réserves", "montant": self.bilan["passif"]["capitaux_propres"]["reserves"]},
                    {"label": "Résultat", "montant": self.bilan["passif"]["capitaux_propres"]["resultat"]}
                ],
                "total_capitaux_propres": self.bilan["passif"]["total_capitaux_propres"],
                "dettes": [
                    {"label": "Emprunts", "montant": self.bilan["passif"]["dettes"]["emprunts"]},
                    {"label": "Dettes fournisseurs", "montant": self.bilan["passif"]["dettes"]["dettes_fournisseurs"]},
                    {"label": "Dettes fiscales", "montant": self.bilan["passif"]["dettes"]["dettes_fiscales"]},
                    {"label": "Autres dettes", "montant": self.bilan["passif"]["dettes"]["autres_dettes"]}
                ],
                "total_dettes": self.bilan["passif"]["total_dettes"],
                "total_passif": self.bilan["passif"]["total"]
            }
        }


if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        donnees = json.loads(input_data)

        entreprise_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
        date_bilan = sys.argv[2] if len(sys.argv) > 2 else None

        bilan_generator = BilanComptable(entreprise_id, date_bilan)
        bilan = bilan_generator.calculer_bilan_depuis_json(json.dumps(donnees))

        print(json.dumps(bilan_generator.generer_bilan_format_simple(), indent=2, ensure_ascii=False))
    except Exception as e:
        import traceback
        print(f"Erreur: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)
