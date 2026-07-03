import re

def process_file(filepath, replacements):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

# 1. ResultsPage.jsx
results_replacements = [
    ("import { useParams, Link } from 'react-router-dom';", "import { useParams, Link } from 'react-router-dom';\nimport { acresToHectares } from '../utils/unitConversion';"),
    ('<div className="yield-unit">kg / hectare</div>', '<div className="yield-unit">kg / acre</div>'),
    ('Math.round(result.predicted_yield)', 'Math.round(result.predicted_yield * 0.404686)')
]
process_file("frontend/src/pages/ResultsPage.jsx", results_replacements)

# 2. HistoryPage.jsx
history_replacements = [
    ('const tableColumn = ["ID", "Date", "Crop", "Predicted Yield (kg/ha)", "Risk Level"];', 'const tableColumn = ["ID", "Date", "Crop", "Predicted Yield (kg/acre)", "Risk Level"];'),
    ('<td className="data">{item.predicted_yield.toFixed(1)} kg/ha</td>', '<td className="data">{(item.predicted_yield * 0.404686).toFixed(1)} kg/acre</td>')
]
process_file("frontend/src/pages/HistoryPage.jsx", history_replacements)

# 3. DashboardPage.jsx
dashboard_replacements = [
    ("label: 'Predicted Yield (kg/ha)',", "label: 'Predicted Yield (kg/acre)',"),
    ("data: history.map(item => item.predicted_yield),", "data: history.map(item => item.predicted_yield * 0.404686),"),
    ('<div className="metric-label">Avg Yield (kg/ha)</div>', '<div className="metric-label">Avg Yield (kg/acre)</div>'),
    ('<span className="badge data">{Math.round(item.predicted_yield)} kg/ha</span>', '<span className="badge data">{Math.round(item.predicted_yield * 0.404686)} kg/acre</span>'),
    ('averageYield: Math.round(totalYield / data.length),', 'averageYield: Math.round((totalYield * 0.404686) / data.length),')
]
process_file("frontend/src/pages/DashboardPage.jsx", dashboard_replacements)

# 4. AnalyticsPage.jsx
analytics_replacements = [
    ("label: 'Average Predicted Yield (kg/ha)',", "label: 'Average Predicted Yield (kg/acre)',"),
    ("data: crops.map(c => c.avg_yield),", "data: crops.map(c => c.avg_yield * 0.404686),"),
    ('<th style={{ padding: \'12px\', textAlign: \'left\' }}>Average Yield (kg/ha)</th>', '<th style={{ padding: \'12px\', textAlign: \'left\' }}>Average Yield (kg/acre)</th>'),
    ('<td className="data">{crop.avg_yield.toFixed(1)}</td>', '<td className="data">{(crop.avg_yield * 0.404686).toFixed(1)}</td>')
]
process_file("frontend/src/pages/AnalyticsPage.jsx", analytics_replacements)

# 5. ProfilePage.jsx
profile_replacements = [
    ("import { updateProfile } from '../services/apiService';", "import { updateProfile } from '../services/apiService';\nimport { acresToHectares, hectaresToAcres } from '../utils/unitConversion';"),
    ('<div className="info-label">Farm Size (Hectares)</div>', '<div className="info-label">Farm Size (Acres)</div>'),
    ('<div className="info-value data">{user.farm_size_hectares || \'Not set\'}</div>', '<div className="info-value data">{user.farm_size_hectares ? hectaresToAcres(user.farm_size_hectares).toFixed(1) : \'Not set\'}</div>'),
    ('<label className="form-label">Farm Size (Hectares)</label>', '<label className="form-label">Farm Size (Acres)</label>'),
    ('name="farm_size_hectares"', 'name="farm_size_acres"'),
    ("farm_size_hectares: user.farm_size_hectares || '',", "farm_size_acres: user.farm_size_hectares ? hectaresToAcres(user.farm_size_hectares).toFixed(1) : '',"),
    ("const res = await updateProfile(values);", "const payload = { ...values, farm_size_hectares: acresToHectares(values.farm_size_acres) };\n      delete payload.farm_size_acres;\n      const res = await updateProfile(payload);")
]
process_file("frontend/src/pages/ProfilePage.jsx", profile_replacements)

# 6. App.test.jsx
test_replacements = [
    ("expect(screen.getByText('Avg Yield (kg/ha)')).toBeInTheDocument();", "expect(screen.getByText('Avg Yield (kg/acre)')).toBeInTheDocument();")
]
process_file("frontend/src/App.test.jsx", test_replacements)

print("Updated all other pages")
