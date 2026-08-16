# Extract species IDs from GBIF API

import requests

species_list = [
    "Anomalocera patersonii",
    "Calanopia elliptica",
    "Labidocera acutifrons",
    "Labidocera brunescens",
    "Labidocera wollastoni",
    "Pontella atlantica",
    "Pontella elegans",
    "Pontella lobiancoi",
    "Pontella mediterranea",
    "Pontellina plumata",
    "Pontellopsis regalis",
    "Pontellopsis villosa",
    "Heterocope saliens",
    "Temora longicornis",
    "Temora stylifera"
]

print("GBIF_TaxonKey_API")
for sp in species_list:
    url = f"https://api.gbif.org/v1/species/match?name={sp}&kingdom=Animalia"
    data = requests.get(url).json()
    
    key = data.get("usageKey", "NOT_FOUND")
    print(f"{key}")