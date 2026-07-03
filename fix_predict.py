import re

with open("frontend/src/pages/PredictPage.jsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace("import SoilStrip from '../components/SoilStrip';", "import SoilStrip from '../components/SoilStrip';\nimport Tooltip from '../components/Tooltip';\nimport { acresToHectares } from '../utils/unitConversion';")

# 2. Schema
content = content.replace("area_hectares: Yup.number().min(0.1).required('Required')", "area_acres: Yup.number().min(0.1).required('Required')")

# 3. Initial values
content = content.replace("fertilizer_used: '', area_hectares: ''", "fertilizer_used: '', area_acres: ''")

# 4. handleSubmit
content = content.replace("const res = await predictYield(values);", """const payload = { ...values, area_hectares: acresToHectares(values.area_acres) };\n      delete payload.area_acres;\n      const res = await predictYield(payload);""")

# 5. Nitrogen label
content = content.replace('<label className="form-label">Nitrogen (N) kg/ha</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Nitrogen (N) kg/acre<Tooltip text="Nitrogen supports leaf and stem growth. Typical range: 40-120 kg/acre depending on crop. Too little slows growth; too much can delay flowering." /></label>')

# 6. Phosphorus label
content = content.replace('<label className="form-label">Phosphorus (P) kg/ha</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Phosphorus (P) kg/acre<Tooltip text="Phosphorus is essential for root development and flowering. Typical range: 20-60 kg/acre." /></label>')

# 7. Potassium label
content = content.replace('<label className="form-label">Potassium (K) kg/ha</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Potassium (K) kg/acre<Tooltip text="Potassium improves disease resistance and overall plant health. Typical range: 10-40 kg/acre." /></label>')

# 8. Soil pH label
content = content.replace('<label className="form-label">Soil pH</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Soil pH<Tooltip text="Measures how acidic or alkaline your soil is, on a 0-14 scale. Most crops grow best between 6.0-7.5. Get this from a soil testing kit or local agriculture office." /></label>')

# 9. Fertilizer Used label
content = content.replace('<label className="form-label">Fertilizer Used (kg)</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Fertilizer Used (kg)<Tooltip text="Total amount of fertilizer applied to the area. Affects nutrient availability." /></label>')

# 10. Area (Hectares) -> Area (Acres)
content = content.replace('<label className="form-label">Area (Hectares)</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Area (Acres)<Tooltip text="The total size of the field being planted, measured in acres." /></label>')
content = content.replace('name="area_hectares"', 'name="area_acres"')

with open("frontend/src/pages/PredictPage.jsx", "w") as f:
    f.write(content)

print("Updated PredictPage.jsx")
