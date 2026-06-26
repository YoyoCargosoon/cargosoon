## Internal Pricing Data

This folder stores internal carrier/channel pricing workbooks.

- `raw/` keeps the original pricing files from the operations team.
- Workbook prefix is treated as the internal channel code, such as `RN`, `YTHQ`, `HMLX`, `BC`.
- These files are for internal reference only and should not be exposed directly in customer-facing pages.
- Channel names, sheet structure, and price rules differ by workbook.
- See `manifest.json` for a machine-readable index and a quick preview of each workbook's directory sheet.

### Current notes

- `RN`, `YTHQ`, and `HMLX` were read successfully and indexed.
- `BC` was copied into `raw/`, but its workbook structure could not be parsed as a standard `.xlsx` file and needs manual verification before automated use.
- Amazon warehouse autocomplete data is generated into `src/data/amazonWarehouseCatalog.generated.json`.
- Refresh that catalog with `npm run pricing:amazon-warehouses` after updating the latest FBA-related workbooks in `Downloads`.
