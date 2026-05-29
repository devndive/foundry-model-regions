#!/bin/bash

# Array der Regionen
regions=("eastus2")
combined_json="[]"

for region in "${regions[@]}"; do
  # Modelle aus der jeweiligen Region abrufen und um das Feld "region" erweitern
  region_models=$(az cognitiveservices model list --location "$region")
  region_models=$(echo "$region_models" | jq --arg region "$region" 'map(. + {region: $region})')
  # Ergebnisse zusammenführen
  combined_json=$(echo "$combined_json" "$region_models" | jq -s 'add')
done

aggregated=$(echo "$combined_json" | jq '
  # Wandelt den vollständigen Regionsnamen in seine Abkürzung um.
  def abbrev_region:
    if . == "sweden-central" then "swc"
    elif . == "france-central" then "fc"
    elif . == "west-europe" then "we"
    else .
    end;

  # Bestimmt, ob ein SKU-String als "sauber" gilt.
  # Ein SKU-String gilt als unsauber, wenn er (case-insensitiv) "batch" oder "globalstandard" enthält,
  def is_clean:
    (test("(batch|globalstandard|globalprovisionedmanaged)"; "i"))
      | not;

  # Filtert ein Array von SKU-Strings:
  # Falls mindestens ein "sauberer" Eintrag vorhanden ist (d.h. is_clean==true),
  # werden nur diese "sauberen" Einträge zurückgegeben, ansonsten das gesamte Array.
  def clean_skus(arr):
    arr | map(select(is_clean));

  # Aggregation: Modelle werden nach model.name gruppiert, um pro Modell ein Aggregat zu haben.
  sort_by(.model.systemData.createdAt)
  | group_by(.model.name)
  | map({
      modelName: .[0].model.name,
      locationSKUs: (
         # Für jede Instanz des Modells wird ein Objekt mit Regionsabkürzung und der Liste 
         # der SKU-Namen (in Kleinbuchstaben) erzeugt.
         [ .[]
           | { region: (.region | abbrev_region),
               skuArr: (.model.skus | map(.name | ascii_downcase))
             }
         ]
         # Für jedes solches Objekt wird die entsprechende Liste von SKU-Strings 
         # (im Format "<region_abbrev>-<sku>") erzeugt.
         | map(
             ([ .region ] as $r
              | (.skuArr | map("\($r[0])-\(.)"))
             )
         )
         | add
         | unique
         | clean_skus(.)
      )
  })
')

# Ausgabe als Tabelle (TSV): Spalten "ModelName" und "LocationSKUs" (SKU-Werte kommasepariert)
echo "$aggregated" | jq -r '(["ModelName", "LocationSKUs"] | (., map("-------------")))
, (.[] | [ .modelName, (.locationSKUs | join(", ")) ]) | @tsv' \
  | sed 's/null-//g' | column -t -s $'\t'
