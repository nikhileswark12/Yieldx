import re

with open("frontend/src/pages/RecommendPage.jsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace("import BlurText from '../components/BlurText';", "import BlurText from '../components/BlurText';\nimport Tooltip from '../components/Tooltip';")

# 2. Nitrogen label
content = content.replace('<label className="form-label">Nitrogen (N)</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Nitrogen (N)<Tooltip text="Nitrogen supports leaf and stem growth. Typical range: 40-120 kg/acre depending on crop. Too little slows growth; too much can delay flowering." /></label>')

# 3. Phosphorus label
content = content.replace('<label className="form-label">Phosphorus (P)</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Phosphorus (P)<Tooltip text="Phosphorus is essential for root development and flowering. Typical range: 20-60 kg/acre." /></label>')

# 4. Potassium label
content = content.replace('<label className="form-label">Potassium (K)</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Potassium (K)<Tooltip text="Potassium improves disease resistance and overall plant health. Typical range: 10-40 kg/acre." /></label>')

# 5. Soil pH label
content = content.replace('<label className="form-label">Soil pH</label>', '<label className="form-label" style={{ display: "flex", alignItems: "center" }}>Soil pH<Tooltip text="Measures how acidic or alkaline your soil is, on a 0-14 scale. Most crops grow best between 6.0-7.5. Get this from a soil testing kit or local agriculture office." /></label>')

with open("frontend/src/pages/RecommendPage.jsx", "w") as f:
    f.write(content)

print("Updated RecommendPage.jsx")
