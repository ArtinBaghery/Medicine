// API Configuration - Using NewsData.io API (your provided key)
        const NEWS_CONFIG = {
            apiKey: 'pub_2b2f2489de5c414eb5e2e074874de321',
            keywords: ['pharmaceutical', 'drug', 'medication', 'FDA', 'clinical trial', 'vaccine', 'treatment', 'pharma'],
            language: 'en',
            pageSize: 6
        };

        // Fallback news data in case API fails
        const FALLBACK_NEWS = [
            {
                title: "FDA Approves New Breakthrough Treatment for Alzheimer's Disease",
                source: { name: "Medical News Today" },
                url: "#",
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            {
                title: "Clinical Trial Shows Promising Results for New Cancer Immunotherapy",
                source: { name: "Journal of Clinical Oncology" },
                url: "#",
                publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
            },
            {
                title: "New Antibiotic Effective Against Drug-Resistant Bacteria",
                source: { name: "Science Daily" },
                url: "#",
                publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            },
            {
                title: "WHO Updates Guidelines for Diabetes Medication Management",
                source: { name: "World Health Organization" },
                url: "#",
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
            },
            {
                title: "Breakthrough in Gene Therapy for Rare Genetic Disorders",
                source: { name: "Nature Medicine" },
                url: "#",
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
            },
            {
                title: "New Study Reveals Benefits of Combination Therapy for Hypertension",
                source: { name: "American Heart Association" },
                url: "#",
                publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
            }
        ];

        let currentNews = [...FALLBACK_NEWS]; // Start with fallback news

        // Fetch Drug News from API
        async function fetchDrugNews() {
            const newsContainer = document.getElementById('drugNews');
            const updateTime = document.getElementById('newsUpdateTime');
            const refreshBtn = document.getElementById('refreshNews');
            
            try {
                // Show loading state
                refreshBtn.classList.add('loading');
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
                
                // Build API URL for NewsData.io
                const query = NEWS_CONFIG.keywords.join(' OR ');
                const url = `https://newsdata.io/api/1/news?apikey=${NEWS_CONFIG.apiKey}&q=${encodeURIComponent(query)}&language=${NEWS_CONFIG.language}&size=${NEWS_CONFIG.pageSize}`;
                
                console.log('Fetching news from:', url);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();

                if (data.status === 'success' && data.results && data.results.length > 0) {
                    currentNews = data.results;
                    displayNews(currentNews);
                    console.log('News loaded successfully from API');
                } else {
                    console.warn('No articles from API, using fallback news');
                    displayNews(currentNews); // Use existing fallback news
                }

                // Update timestamp
                updateTime.textContent = new Date().toLocaleTimeString();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';

            } catch (error) {
                console.error('Error fetching news:', error);
                // Don't show error to user, just use fallback news
                console.log('Using fallback news due to API error');
                displayNews(currentNews);
                updateTime.textContent = new Date().toLocaleTimeString() + ' (Cached)';
            } finally {
                refreshBtn.classList.remove('loading');
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            }
        }

        // Display News Articles
        function displayNews(articles) {
            const newsContainer = document.getElementById('drugNews');
            
            if (!articles || articles.length === 0) {
                newsContainer.innerHTML = `
                    <div class="news-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        No news available at the moment
                    </div>
                `;
                return;
            }

            const newsHTML = articles.map(article => `
                <div class="news-item">
                    <div class="news-title">
                        <a href="${article.url || '#'}" target="_blank" rel="noopener noreferrer" title="${article.title}">
                            ${article.title}
                        </a>
                    </div>
                    <div class="news-source">
                        <span>${article.source_id || article.source?.name || 'Unknown Source'}</span>
                        <span class="news-date">${formatDate(article.pubDate || article.publishedAt)}</span>
                    </div>
                </div>
            `).join('');

            newsContainer.innerHTML = newsHTML;
        }

        // Format Date for Display
        function formatDate(dateString) {
            if (!dateString) return 'Recently';
            
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            
            if (isNaN(diffHours)) return 'Recently';
            
            if (diffHours < 1) {
                return 'Just now';
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 7) {
                return `${diffDays}d ago`;
            } else {
                return date.toLocaleDateString();
            }
        }

        // Initialize news system
        function initNewsSystem() {
            console.log('Initializing news system...');
            
            // Load news immediately
            fetchDrugNews();
            
            // Set up refresh button
            const refreshBtn = document.getElementById('refreshNews');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', fetchDrugNews);
            }
            
            // Auto-refresh every 15 minutes
            setInterval(fetchDrugNews, 15 * 60 * 1000);
            
            // Also refresh when page becomes visible again
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden) {
                    // Refresh if it's been more than 30 minutes since last update
                    const lastUpdate = document.getElementById('newsUpdateTime').textContent;
                    if (lastUpdate && lastUpdate.includes('(Cached)')) {
                        fetchDrugNews();
                    }
                }
            });
        }

        // Start the news system when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Show fallback news immediately
            displayNews(currentNews);
            
            // Then try to fetch fresh news
            setTimeout(initNewsSystem, 1000);
        });

        // Also initialize if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initNewsSystem);
        } else {
            initNewsSystem();
        }


// Drug database with detailed information for all medications
const drugDatabase = {

    "Lisinopril": {
        class: "ACE Inhibitor",
        brandNames: "Zestril, Prinivil, Qbrelis",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Lisinopril is used to treat high blood pressure (hypertension), heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: Initial dose 10 mg once daily. Maintenance dose 20-40 mg once daily. Maximum dose 80 mg/day.",
        sideEffects: [
            "Dizziness or lightheadedness",
            "Persistent dry cough",
            "Headache",
            "Fatigue",
            "Nausea"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "May cause excessive blood pressure lowering" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Lithium", level: "high", description: "May increase lithium levels" },
            { drug: "Potassium supplements", level: "medium", description: "May increase risk of hyperkalemia" }
        ],
        safety: "Do not use during pregnancy. May cause injury or death to the unborn baby. Avoid in patients with history of angioedema."
    },
    "Losartan": {
        class: "Angiotensin II Receptor Blocker (ARB)",
        brandNames: "Cozaar",
        administration: "Oral",
        halfLife: "6-9 hours",
        uses: "Losartan is used to treat high blood pressure (hypertension) and to protect the kidneys from damage due to diabetes.",
        dosage: "For hypertension: Initial dose 50 mg once daily. Can be increased to 100 mg once daily. For diabetic nephropathy: 50-100 mg once daily.",
        sideEffects: [
            "Dizziness",
            "Upper respiratory infection",
            "Back pain",
            "Low blood pressure",
            "Increased potassium levels"
        ],
        interactions: [
            { drug: "Potassium-sparing diuretics", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Lithium", level: "high", description: "May increase lithium levels" }
        ],
        safety: "Do not use during pregnancy. May cause injury or death to the unborn baby. Use with caution in patients with renal impairment."
    },
    "Amlodipine": {
        class: "Calcium Channel Blocker",
        brandNames: "Norvasc",
        administration: "Oral",
        halfLife: "30-50 hours",
        uses: "Amlodipine is used to treat high blood pressure and chest pain (angina).",
        dosage: "For hypertension: Initial dose 5 mg once daily. Maximum dose 10 mg once daily. For angina: 5-10 mg once daily.",
        sideEffects: [
            "Swelling of ankles or feet",
            "Dizziness",
            "Flushing",
            "Headache",
            "Fatigue",
            "Nausea"
        ],
        interactions: [
            { drug: "Simvastatin", level: "medium", description: "May increase simvastatin levels" },
            { drug: "Cyclosporine", level: "medium", description: "May increase cyclosporine levels" }
        ],
        safety: "Use with caution in patients with severe aortic stenosis. May cause hypotension, especially when starting therapy."
    },
    "Atenolol": {
        class: "Beta Blocker",
        brandNames: "Tenormin",
        administration: "Oral",
        halfLife: "6-7 hours",
        uses: "Atenolol is used to treat high blood pressure, angina, and to reduce the risk of death after a heart attack.",
        dosage: "For hypertension: 25-100 mg once daily. For angina: 50-100 mg once daily. Maximum dose 100 mg/day.",
        sideEffects: [
            "Fatigue",
            "Dizziness",
            "Cold hands and feet",
            "Depression",
            "Shortness of breath",
            "Bradycardia"
        ],
        interactions: [
            { drug: "Calcium channel blockers", level: "high", description: "Increased risk of bradycardia and heart block" },
            { drug: "Insulin", level: "medium", description: "May mask symptoms of hypoglycemia" },
            { drug: "Clonidine", level: "high", description: "Risk of severe rebound hypertension if discontinued together" }
        ],
        safety: "Do not abruptly discontinue. May exacerbate heart failure in susceptible patients. Use with caution in patients with asthma or COPD."
    },
    "Metoprolol": {
        class: "Beta Blocker",
        brandNames: "Lopressor, Toprol XL",
        administration: "Oral",
        halfLife: "3-7 hours",
        uses: "Metoprolol is used to treat high blood pressure, chest pain (angina), and heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: 50-100 mg once or twice daily. Maximum dose 450 mg/day. Extended-release: 25-400 mg once daily.",
        sideEffects: [
            "Tiredness",
            "Dizziness",
            "Depression",
            "Shortness of breath",
            "Bradycardia",
            "Cold hands and feet"
        ],
        interactions: [
            { drug: "Other beta blockers", level: "high", description: "Additive effects on heart rate and blood pressure" },
            { drug: "Calcium channel blockers", level: "high", description: "Increased risk of bradycardia and heart block" },
            { drug: "Digoxin", level: "medium", description: "Additive effects on heart rate" }
        ],
        safety: "Do not abruptly discontinue. Use with caution in patients with asthma, diabetes, or heart failure."
    },
    "Enalapril": {
        class: "ACE Inhibitor",
        brandNames: "Vasotec",
        administration: "Oral",
        halfLife: "11 hours",
        uses: "Enalapril is used to treat high blood pressure, heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: 5-40 mg daily in 1-2 divided doses. For heart failure: 2.5-20 mg twice daily.",
        sideEffects: [
            "Dizziness",
            "Cough",
            "Headache",
            "Fatigue",
            "Nausea",
            "Hyperkalemia"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "Risk of first-dose hypotension" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" }
        ],
        safety: "Contraindicated in pregnancy. Monitor renal function and potassium levels regularly."
    },
    "Captopril": {
        class: "ACE Inhibitor",
        brandNames: "Capoten",
        administration: "Oral",
        halfLife: "2 hours",
        uses: "Captopril is used to treat high blood pressure, heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: 25-150 mg two or three times daily. For heart failure: 6.25-50 mg three times daily.",
        sideEffects: [
            "Cough",
            "Dizziness",
            "Taste disturbance",
            "Rash",
            "Hypotension",
            "Hyperkalemia"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "Risk of severe hypotension" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "Reduced antihypertensive effect" }
        ],
        safety: "Take on empty stomach. Monitor for angioedema, especially with first dose."
    },
    "Ramipril": {
        class: "ACE Inhibitor",
        brandNames: "Altace",
        administration: "Oral",
        halfLife: "13-17 hours",
        uses: "Ramipril is used to treat high blood pressure, reduce risk of heart attack and stroke in high-risk patients, and treat heart failure.",
        dosage: "For hypertension: 2.5-10 mg once daily. For cardiovascular risk reduction: 2.5-10 mg once daily.",
        sideEffects: [
            "Cough",
            "Dizziness",
            "Headache",
            "Fatigue",
            "Nausea",
            "Hypotension"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "Risk of severe hypotension" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "Potassium supplements", level: "medium", description: "Increased risk of hyperkalemia" }
        ],
        safety: "Contraindicated in pregnancy. Monitor renal function and electrolytes regularly."
    },
    "Valsartan": {
        class: "Angiotensin II Receptor Blocker (ARB)",
        brandNames: "Diovan",
        administration: "Oral",
        halfLife: "6 hours",
        uses: "Valsartan is used to treat high blood pressure, heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: 80-320 mg once daily. For heart failure: 40-160 mg twice daily.",
        sideEffects: [
            "Dizziness",
            "Viral infection",
            "Fatigue",
            "Abdominal pain",
            "Hyperkalemia"
        ],
        interactions: [
            { drug: "Potassium-sparing diuretics", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" }
        ],
        safety: "Contraindicated in pregnancy. Use with caution in patients with renal impairment or renal artery stenosis."
    },
    "Irbesartan": {
        class: "Angiotensin II Receptor Blocker (ARB)",
        brandNames: "Avapro",
        administration: "Oral",
        halfLife: "11-15 hours",
        uses: "Irbesartan is used to treat high blood pressure and to protect kidney function in patients with type 2 diabetes and hypertension.",
        dosage: "For hypertension: 150-300 mg once daily. For nephropathy: 300 mg once daily.",
        sideEffects: [
            "Dizziness",
            "Muscle pain",
            "Heartburn",
            "Diarrhea",
            "Upper respiratory infection"
        ],
        interactions: [
            { drug: "Potassium supplements", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" }
        ],
        safety: "Contraindicated in pregnancy. Monitor renal function and potassium levels in patients with renal impairment."
    },
    "Telmisartan": {
        class: "Angiotensin II Receptor Blocker (ARB)",
        brandNames: "Micardis",
        administration: "Oral",
        halfLife: "24 hours",
        uses: "Telmisartan is used to treat high blood pressure and to reduce cardiovascular risk in patients unable to take ACE inhibitors.",
        dosage: "20-80 mg once daily. Most patients start with 40 mg once daily.",
        sideEffects: [
            "Upper respiratory infection",
            "Back pain",
            "Sinusitis",
            "Diarrhea",
            "Pharyngitis"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" }
        ],
        safety: "Contraindicated in pregnancy. Use with caution in patients with biliary obstruction disorders."
    },
    "Carvedilol": {
        class: "Alpha/Beta Blocker",
        brandNames: "Coreg",
        administration: "Oral",
        halfLife: "7-10 hours",
        uses: "Carvedilol is used to treat high blood pressure, heart failure, and to improve survival after a heart attack.",
        dosage: "For hypertension: 6.25-25 mg twice daily. For heart failure: 3.125-25 mg twice daily.",
        sideEffects: [
            "Dizziness",
            "Fatigue",
            "Weight gain",
            "Bradycardia",
            "Diarrhea",
            "Hyperglycemia"
        ],
        interactions: [
            { drug: "Clonidine", level: "high", description: "Risk of severe rebound hypertension" },
            { drug: "Cyclosporine", level: "medium", description: "Increased cyclosporine levels" },
            { drug: "Insulin", level: "medium", description: "May mask hypoglycemia symptoms" }
        ],
        safety: "Do not abruptly discontinue. Use with caution in patients with asthma, diabetes, or liver disease."
    },
    "Bisoprolol": {
        class: "Beta Blocker",
        brandNames: "Zebeta",
        administration: "Oral",
        halfLife: "9-12 hours",
        uses: "Bisoprolol is used to treat high blood pressure. It may be used alone or in combination with other antihypertensive agents.",
        dosage: "2.5-10 mg once daily. Maximum dose 20 mg once daily. Start with 2.5-5 mg once daily.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Fatigue",
            "Diarrhea",
            "Bradycardia",
            "Cold extremities"
        ],
        interactions: [
            { drug: "Calcium channel blockers", level: "high", description: "Increased risk of bradycardia" },
            { drug: "Clonidine", level: "high", description: "Risk of rebound hypertension" },
            { drug: "Insulin", level: "medium", description: "May mask hypoglycemia symptoms" }
        ],
        safety: "Do not abruptly discontinue. Use with caution in patients with bronchospastic disease, diabetes, or thyrotoxicosis."
    },
    "Diltiazem": {
        class: "Calcium Channel Blocker",
        brandNames: "Cardizem, Tiazac",
        administration: "Oral",
        halfLife: "3-4.5 hours",
        uses: "Diltiazem is used to treat high blood pressure, chronic stable angina, and atrial arrhythmias.",
        dosage: "For hypertension: 120-360 mg daily in divided doses. Extended-release: 180-480 mg once daily.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Edema",
            "Flushing",
            "Nausea",
            "Bradycardia"
        ],
        interactions: [
            { drug: "Beta blockers", level: "high", description: "Increased risk of bradycardia and heart block" },
            { drug: "Statins", level: "medium", description: "May increase statin levels" },
            { drug: "Cyclosporine", level: "medium", description: "Increased cyclosporine levels" }
        ],
        safety: "Use with caution in patients with heart failure, liver impairment, or conduction abnormalities."
    },
    "Verapamil": {
        class: "Calcium Channel Blocker",
        brandNames: "Calan, Verelan",
        administration: "Oral",
        halfLife: "2.8-7.4 hours",
        uses: "Verapamil is used to treat high blood pressure, angina, and certain heart rhythm disorders.",
        dosage: "For hypertension: 80-480 mg daily in divided doses. Extended-release: 120-480 mg once daily.",
        sideEffects: [
            "Constipation",
            "Dizziness",
            "Headache",
            "Nausea",
            "Edema",
            "Bradycardia"
        ],
        interactions: [
            { drug: "Beta blockers", level: "high", description: "Increased risk of bradycardia and heart block" },
            { drug: "Digoxin", level: "high", description: "Increased digoxin levels" },
            { drug: "Statins", level: "medium", description: "May increase statin levels" }
        ],
        safety: "Contraindicated in severe left ventricular dysfunction, sick sinus syndrome, and 2nd/3rd degree AV block."
    },
    "Hydrochlorothiazide": {
        class: "Thiazide Diuretic",
        brandNames: "Microzide, Esidrix",
        administration: "Oral",
        halfLife: "5.6-14.8 hours",
        uses: "Hydrochlorothiazide is used to treat high blood pressure and edema associated with heart failure, liver cirrhosis, and renal disease.",
        dosage: "For hypertension: 12.5-50 mg once daily. For edema: 25-100 mg daily in 1-2 divided doses.",
        sideEffects: [
            "Dizziness",
            "Headache",
            "Increased urination",
            "Electrolyte imbalance",
            "Photosensitivity",
            "Gout"
        ],
        interactions: [
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce diuretic effect" },
            { drug: "Corticosteroids", level: "medium", description: "Increased potassium loss" }
        ],
        safety: "Monitor electrolytes regularly. Use with caution in patients with renal impairment, diabetes, or gout."
    },
    "Chlorthalidone": {
        class: "Thiazide-like Diuretic",
        brandNames: "Thalitone",
        administration: "Oral",
        halfLife: "40-60 hours",
        uses: "Chlorthalidone is used to treat high blood pressure and edema associated with heart failure, renal disease, or liver cirrhosis.",
        dosage: "12.5-50 mg once daily. Usually started at 12.5-25 mg once daily.",
        sideEffects: [
            "Dizziness",
            "Weakness",
            "Muscle cramps",
            "Electrolyte imbalance",
            "Impotence",
            "Photosensitivity"
        ],
        interactions: [
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "Digoxin", level: "medium", description: "Increased risk of digoxin toxicity with hypokalemia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce diuretic effect" }
        ],
        safety: "Monitor electrolytes, particularly potassium, regularly. Use with caution in patients with renal or hepatic impairment."
    },
    "Furosemide": {
        class: "Loop Diuretic",
        brandNames: "Lasix",
        administration: "Oral, IV",
        halfLife: "2 hours",
        uses: "Furosemide is used to treat edema associated with heart failure, liver cirrhosis, and renal disease, including nephrotic syndrome.",
        dosage: "For edema: 20-80 mg once or twice daily. Maximum dose 600 mg/day. IV: 20-40 mg.",
        sideEffects: [
            "Dehydration",
            "Electrolyte imbalance",
            "Dizziness",
            "Hearing loss (high doses)",
            "Photosensitivity",
            "Ototoxicity"
        ],
        interactions: [
            { drug: "Aminoglycosides", level: "high", description: "Increased risk of ototoxicity" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce diuretic effect" }
        ],
        safety: "Monitor electrolytes and renal function regularly. Use with caution in patients with renal impairment or hearing disorders."
    },
    "Spironolactone": {
        class: "Potassium-Sparing Diuretic",
        brandNames: "Aldactone",
        administration: "Oral",
        halfLife: "1.4 hours",
        uses: "Spironolactone is used to treat high blood pressure, edema associated with heart failure or liver cirrhosis, and primary hyperaldosteronism.",
        dosage: "For hypertension: 50-100 mg daily in 1-2 divided doses. For edema: 100-400 mg daily.",
        sideEffects: [
            "Hyperkalemia",
            "Gynecomastia (men)",
            "Menstrual irregularities (women)",
            "Drowsiness",
            "Diarrhea",
            "Headache"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "Increased risk of renal impairment" },
            { drug: "Digoxin", level: "medium", description: "May interfere with digoxin assays" }
        ],
        safety: "Contraindicated in patients with hyperkalemia, acute renal failure, or anuria. Monitor potassium levels regularly."
    },
    "Eplerenone": {
        class: "Potassium-Sparing Diuretic",
        brandNames: "Inspra",
        administration: "Oral",
        halfLife: "4-6 hours",
        uses: "Eplerenone is used to treat high blood pressure and to improve survival in patients with heart failure after a heart attack.",
        dosage: "For hypertension: 50-100 mg once daily. For heart failure: 25-50 mg once daily.",
        sideEffects: [
            "Hyperkalemia",
            "Dizziness",
            "Fatigue",
            "Diarrhea",
            "Cough",
            "Abdominal pain"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "Potassium supplements", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increased eplerenone levels" }
        ],
        safety: "Contraindicated in patients with hyperkalemia, renal impairment, or type 2 diabetes with microalbuminuria. Monitor potassium regularly."
    },
    "Clonidine": {
        class: "Central Alpha-2 Agonist",
        brandNames: "Catapres",
        administration: "Oral, Transdermal",
        halfLife: "12-16 hours",
        uses: "Clonidine is used to treat high blood pressure. It may also be used for ADHD, menopausal flushing, and opioid withdrawal.",
        dosage: "For hypertension: 0.1-0.8 mg daily in divided doses. Transdermal: applied weekly.",
        sideEffects: [
            "Dry mouth",
            "Drowsiness",
            "Dizziness",
            "Constipation",
            "Sedation",
            "Rebound hypertension"
        ],
        interactions: [
            { drug: "Beta blockers", level: "high", description: "Risk of severe rebound hypertension" },
            { drug: "TCAs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "CNS depressants", level: "medium", description: "Additive sedative effects" }
        ],
        safety: "Do not abruptly discontinue. Taper gradually over 2-4 days to avoid rebound hypertension."
    },
    "Hydralazine": {
        class: "Direct Vasodilator",
        brandNames: "Apresoline",
        administration: "Oral, IV",
        halfLife: "2-8 hours",
        uses: "Hydralazine is used to treat high blood pressure, usually in combination with other antihypertensive agents.",
        dosage: "10-50 mg four times daily. Maximum dose 300 mg/day.",
        sideEffects: [
            "Headache",
            "Tachycardia",
            "Nausea",
            "Flushing",
            "Lupus-like syndrome",
            "Peripheral neuropathy"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Risk of severe hypotension" },
            { drug: "Beta blockers", level: "medium", description: "May counteract reflex tachycardia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" }
        ],
        safety: "Use with caution in patients with coronary artery disease or mitral valve rheumatic heart disease. Monitor for lupus-like symptoms."
    },
    "Minoxidil": {
        class: "Direct Vasodilator",
        brandNames: "Loniten",
        administration: "Oral",
        halfLife: "4.2 hours",
        uses: "Minoxidil is used to treat severe high blood pressure that has not responded to other antihypertensive agents.",
        dosage: "5-40 mg once daily. Maximum dose 100 mg/day.",
        sideEffects: [
            "Hypertrichosis (excessive hair growth)",
            "Edema",
            "Tachycardia",
            "Pericardial effusion",
            "Headache",
            "Weight gain"
        ],
        interactions: [
            { drug: "Guanethidine", level: "high", description: "Risk of severe orthostatic hypotension" },
            { drug: "Diuretics", level: "medium", description: "May help control edema" },
            { drug: "Beta blockers", level: "medium", description: "May help control reflex tachycardia" }
        ],
        safety: "Reserved for severe, treatment-resistant hypertension. Requires concurrent diuretic and beta blocker therapy."
    },
    "Nebivolol": {
        class: "Beta Blocker",
        brandNames: "Bystolic",
        administration: "Oral",
        halfLife: "12-19 hours",
        uses: "Nebivolol is used to treat high blood pressure. It has vasodilatory properties through nitric oxide release.",
        dosage: "5-40 mg once daily. Start with 5 mg once daily.",
        sideEffects: [
            "Headache",
            "Fatigue",
            "Dizziness",
            "Diarrhea",
            "Nausea",
            "Bradycardia"
        ],
        interactions: [
            { drug: "Other beta blockers", level: "high", description: "Additive bradycardic effects" },
            { drug: "Digitalis", level: "medium", description: "Additive effects on AV conduction" },
            { drug: "CYP2D6 inhibitors", level: "medium", description: "Increased nebivolol levels" }
        ],
        safety: "Do not abruptly discontinue. Use with caution in patients with severe hepatic impairment."
    },
    "Atorvastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Lipitor",
        administration: "Oral",
        halfLife: "14 hours",
        uses: "Atorvastatin is used to lower bad cholesterol and triglycerides in the blood. It also raises good cholesterol and reduces the risk of heart attack, stroke, and other heart complications in people with diabetes, coronary heart disease, or other risk factors.",
        dosage: "Initial dose 10-20 mg once daily. Maintenance dose 10-80 mg daily. Maximum dose 80 mg/day. Take with or without food.",
        sideEffects: [
            "Headache",
            "Muscle pain or weakness",
            "Joint pain",
            "Nausea",
            "Constipation",
            "Diarrhea",
            "Liver enzyme abnormalities"
        ],
        interactions: [
            { drug: "Grapefruit juice", level: "high", description: "May significantly increase drug levels and risk of side effects" },
            { drug: "Cyclosporine", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Certain antibiotics", level: "high", description: "Increased risk of myopathy" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "May cause serious muscle problems (myopathy and rhabdomyolysis). Report unexplained muscle pain, tenderness, or weakness. Regular liver function tests recommended. Not recommended during pregnancy."
    },

    "Rosuvastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Crestor",
        administration: "Oral",
        halfLife: "19 hours",
        uses: "Rosuvastatin is used along with a proper diet to lower bad cholesterol and triglycerides and raise good cholesterol in the blood. It reduces the risk of heart attack and stroke in certain people.",
        dosage: "Initial dose 5-10 mg once daily. Maintenance dose 5-40 mg daily. Maximum dose 40 mg/day. Take with or without food.",
        sideEffects: [
            "Headache",
            "Muscle pain",
            "Abdominal pain",
            "Nausea",
            "Weakness",
            "Memory problems",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Cyclosporine", level: "high", description: "Significantly increases rosuvastatin levels" },
            { drug: "Gemfibrozil", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Oral contraceptives", level: "medium", description: "May increase hormone levels" }
        ],
        safety: "Risk of serious muscle problems. Asian patients may require lower doses. Monitor liver enzymes before and during treatment. Contraindicated in pregnancy."
    },

    "Simvastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Zocor",
        administration: "Oral",
        halfLife: "1.9 hours",
        uses: "Simvastatin is used to lower cholesterol and triglycerides in the blood. It helps prevent heart attacks, strokes, and other heart complications in people with high cholesterol and other risk factors.",
        dosage: "Initial dose 10-20 mg once daily in the evening. Maintenance dose 5-80 mg daily. Maximum dose 80 mg/day.",
        sideEffects: [
            "Headache",
            "Abdominal pain",
            "Constipation",
            "Upper respiratory infection",
            "Muscle pain",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Grapefruit juice", level: "high", description: "Avoid large quantities" },
            { drug: "Amiodarone", level: "high", description: "Increased risk of myopathy" },
            { drug: "Verapamil", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Diltiazem", level: "medium", description: "Increased risk of side effects" }
        ],
        safety: "Higher risk of muscle problems compared to other statins. 80 mg dose has increased risk. Regular liver function monitoring required. Not for use during pregnancy."
    },

    "Pravastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Pravachol",
        administration: "Oral",
        halfLife: "1.8 hours",
        uses: "Pravastatin is used to lower cholesterol and triglycerides in the blood. It helps slow the progression of heart disease and reduces the risk of heart attacks and strokes.",
        dosage: "Initial dose 40 mg once daily. Maintenance dose 10-80 mg daily. Take at bedtime, with or without food.",
        sideEffects: [
            "Headache",
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Rash",
            "Muscle pain",
            "Liver enzyme changes"
        ],
        interactions: [
            { drug: "Cyclosporine", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Gemfibrozil", level: "medium", description: "May increase risk of myopathy" },
            { drug: "Colchicine", level: "medium", description: "Increased risk of muscle toxicity" }
        ],
        safety: "Generally better tolerated than other statins. Still requires liver function monitoring. Report unexplained muscle pain. Contraindicated in active liver disease and pregnancy."
    },

    "Lovastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Mevacor, Altoprev",
        administration: "Oral",
        halfLife: "2-3 hours",
        uses: "Lovastatin is used to lower cholesterol and triglycerides in the blood. It helps prevent heart disease and heart attacks in people with high cholesterol.",
        dosage: "Immediate-release: 20 mg once daily with evening meal. Extended-release: 20-60 mg daily at bedtime. Maximum dose 80 mg/day.",
        sideEffects: [
            "Headache",
            "Flatulence",
            "Abdominal pain",
            "Diarrhea",
            "Nausea",
            "Muscle cramps",
            "Rash"
        ],
        interactions: [
            { drug: "Grapefruit juice", level: "high", description: "Significantly increases drug levels" },
            { drug: "Cyclosporine", level: "high", description: "Increased risk of rhabdomyolysis" },
            { drug: "Gemfibrozil", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Niacin", level: "medium", description: "Increased risk of myopathy" }
        ],
        safety: "Take with food for better absorption. Higher risk of muscle problems with certain interactions. Regular liver function tests needed. Avoid during pregnancy."
    },

    "Pitavastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Livalo, Zypitamag",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Pitavastatin is used to lower bad cholesterol and triglycerides while raising good cholesterol. It's often prescribed when patients cannot tolerate other statins.",
        dosage: "Initial dose 2 mg once daily. Maintenance dose 1-4 mg daily. Maximum dose 4 mg/day. Take with or without food.",
        sideEffects: [
            "Back pain",
            "Constipation",
            "Diarrhea",
            "Muscle pain",
            "Pain in extremities",
            "Insomnia"
        ],
        interactions: [
            { drug: "Cyclosporine", level: "high", description: "Contraindicated combination" },
            { drug: "Erythromycin", level: "medium", description: "May increase pitavastatin levels" },
            { drug: "Rifampin", level: "medium", description: "May decrease pitavastatin effectiveness" }
        ],
        safety: "Generally well-tolerated with fewer drug interactions than other statins. Still requires liver function monitoring. Report muscle pain or weakness."
    },

    "Fluvastatin": {
        class: "HMG-CoA Reductase Inhibitor (Statin)",
        brandNames: "Lescol, Lescol XL",
        administration: "Oral",
        halfLife: "2.3 hours",
        uses: "Fluvastatin is used to lower cholesterol and triglycerides in the blood. It helps prevent heart disease progression and cardiovascular events in high-risk patients.",
        dosage: "Immediate-release: 20-40 mg twice daily. Extended-release: 80 mg once daily at bedtime.",
        sideEffects: [
            "Headache",
            "Dyspepsia",
            "Abdominal pain",
            "Nausea",
            "Insomnia",
            "Muscle pain"
        ],
        interactions: [
            { drug: "Cyclosporine", level: "high", description: "Increased risk of muscle toxicity" },
            { drug: "Fluconazole", level: "medium", description: "May increase fluvastatin levels" },
            { drug: "Cholestyramine", level: "medium", description: "Take at least 4 hours apart" }
        ],
        safety: "Generally considered a weaker statin. Still effective for cholesterol lowering. Monitor liver enzymes. Take extended-release at bedtime."
    },

    "Ezetimibe": {
        class: "Cholesterol Absorption Inhibitor",
        brandNames: "Zetia",
        administration: "Oral",
        halfLife: "22 hours",
        uses: "Ezetimibe is used to lower high cholesterol alone or with statins. It works by decreasing cholesterol absorption in the intestine.",
        dosage: "10 mg once daily. Can be taken with or without food, with or without statins.",
        sideEffects: [
            "Diarrhea",
            "Joint pain",
            "Tiredness",
            "Sinusitis",
            "Upper respiratory infection",
            "Abdominal pain"
        ],
        interactions: [
            { drug: "Cholestyramine", level: "medium", description: "Decreases ezetimibe absorption" },
            { drug: "Fibrates", level: "medium", description: "May increase risk of gallstones" },
            { drug: "Cyclosporine", level: "medium", description: "Increases ezetimibe levels" }
        ],
        safety: "Generally well-tolerated. Can be used in patients who cannot take statins. Monitor liver function when used with statins. Not for use during pregnancy."
    },

    "Fenofibrate": {
        class: "Fibrate",
        brandNames: "Tricor, Antara, Lipofen",
        administration: "Oral",
        halfLife: "20 hours",
        uses: "Fenofibrate is used to lower high triglycerides and increase good cholesterol. It's particularly effective for patients with high triglycerides and low HDL.",
        dosage: "Dose varies by formulation: 48-145 mg daily. Take with food for better absorption.",
        sideEffects: [
            "Abdominal pain",
            "Back pain",
            "Headache",
            "Nausea",
            "Increased liver enzymes",
            "Respiratory disorders"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increases anticoagulant effect" },
            { drug: "Statins", level: "medium", description: "Increased risk of muscle problems" },
            { drug: "Cyclosporine", level: "medium", description: "Increased risk of kidney problems" }
        ],
        safety: "Monitor liver function regularly. Increased risk of gallstones. Use with caution in kidney impairment. Contraindicated in severe renal disease."
    },

    "Gemfibrozil": {
        class: "Fibrate",
        brandNames: "Lopid",
        administration: "Oral",
        halfLife: "1.5 hours",
        uses: "Gemfibrozil is used to lower high triglycerides and reduce the risk of heart disease in certain patients with high cholesterol and triglycerides.",
        dosage: "600 mg twice daily, 30 minutes before morning and evening meals.",
        sideEffects: [
            "Abdominal pain",
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Rash",
            "Dizziness",
            "Blurred vision"
        ],
        interactions: [
            { drug: "Statins", level: "high", description: "Significantly increases risk of muscle problems" },
            { drug: "Warfarin", level: "high", description: "Increases anticoagulant effect" },
            { drug: "Repaglinide", level: "high", description: "Increases risk of hypoglycemia" }
        ],
        safety: "Take 30 minutes before meals. High risk of muscle problems when combined with statins. Regular liver function monitoring required."
    },

    "Niacin": {
        class: "Vitamin B3",
        brandNames: "Niaspan, Slo-Niacin",
        administration: "Oral",
        halfLife: "20-45 minutes",
        uses: "Niacin is used to lower bad cholesterol and triglycerides and raise good cholesterol. It's often used when statins alone are insufficient.",
        dosage: "500 mg once daily at bedtime, gradually increased to 1-2 grams daily. Take with low-fat snack to reduce flushing.",
        sideEffects: [
            "Flushing (redness, warmth, itching)",
            "Headache",
            "Dizziness",
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Statins", level: "medium", description: "Increased risk of muscle problems" },
            { drug: "Alcohol", level: "medium", description: "May increase flushing" },
            { drug: "Blood pressure medications", level: "medium", description: "May increase dizziness" }
        ],
        safety: "Take aspirin 30 minutes before dose to reduce flushing. Regular liver function tests required. Monitor blood sugar in diabetics."
    },

    "Colestipol": {
        class: "Bile Acid Sequestrant",
        brandNames: "Colestid",
        administration: "Oral",
        halfLife: "Not applicable",
        uses: "Colestipol is used to lower high cholesterol alone or with other medications. It works by binding bile acids in the intestine.",
        dosage: "Tablets: 2-16 grams daily. Granules: 5-30 grams daily. Take with plenty of fluid.",
        sideEffects: [
            "Constipation",
            "Abdominal pain",
            "Bloating",
            "Gas",
            "Nausea",
            "Vomiting",
            "Diarrhea"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Take at least 4-6 hours apart" },
            { drug: "Digoxin", level: "high", description: "Take at least 1-2 hours before or 4-6 hours after" },
            { drug: "Thyroid medications", level: "medium", description: "Take at least 4-6 hours apart" }
        ],
        safety: "Take other medications 1 hour before or 4 hours after colestipol. Increase fluid and fiber intake to prevent constipation. May interfere with fat-soluble vitamin absorption."
    },

    "Cholestyramine": {
        class: "Bile Acid Sequestrant",
        brandNames: "Questran, Prevalite",
        administration: "Oral",
        halfLife: "Not applicable",
        uses: "Cholestyramine is used to lower high cholesterol and to treat itching associated with partial biliary obstruction.",
        dosage: "4 grams once or twice daily, gradually increased to 8-16 grams daily in divided doses. Mix with water or non-carbonated beverage.",
        sideEffects: [
            "Constipation",
            "Abdominal pain",
            "Bloating",
            "Gas",
            "Nausea",
            "Vomiting",
            "Diarrhea"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Take at least 4-6 hours apart" },
            { drug: "Digoxin", level: "high", description: "Take at least 1-2 hours before or 4-6 hours after" },
            { drug: "Thyroid medications", level: "medium", description: "Take at least 4-6 hours apart" }
        ],
        safety: "Mix powder well with liquid. Take other medications 1 hour before or 4-6 hours after cholestyramine. May cause vitamin deficiencies with long-term use."
    },

    "Alirocumab": {
        class: "PCSK9 Inhibitor",
        brandNames: "Praluent",
        administration: "Subcutaneous injection",
        halfLife: "17-20 days",
        uses: "Alirocumab is used to lower high cholesterol in patients with familial hypercholesterolemia or clinical atherosclerotic cardiovascular disease who require additional lowering.",
        dosage: "75 mg or 150 mg every 2 weeks. May increase to 150 mg every 2 weeks if needed.",
        sideEffects: [
            "Injection site reactions",
            "Common cold symptoms",
            "Itching",
            "Rash",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "None known", level: "low", description: "No significant drug interactions reported" }
        ],
        safety: "Rotate injection sites. Monitor for allergic reactions. Patient must be trained in proper injection technique. Store in refrigerator."
    },

    "Evolocumab": {
        class: "PCSK9 Inhibitor",
        brandNames: "Repatha",
        administration: "Subcutaneous injection",
        halfLife: "11-17 days",
        uses: "Evolocumab is used to lower high cholesterol in patients with familial hypercholesterolemia or established cardiovascular disease who need additional cholesterol lowering.",
        dosage: "140 mg every 2 weeks or 420 mg once monthly. Administer subcutaneously.",
        sideEffects: [
            "Injection site reactions",
            "Upper respiratory infection",
            "Common cold",
            "Back pain",
            "Flu-like symptoms"
        ],
        interactions: [
            { drug: "None known", level: "low", description: "No significant drug interactions reported" }
        ],
        safety: "Proper injection technique is essential. Rotate injection sites. Monitor for hypersensitivity reactions. Refrigerate until use."
    },

    "Bempedoic acid": {
        class: "ATP Citrate Lyase Inhibitor",
        brandNames: "Nexletol",
        administration: "Oral",
        halfLife: "15-30 hours",
        uses: "Bempedoic acid is used to lower high cholesterol alone or with other medications in patients who cannot tolerate statins or need additional cholesterol lowering.",
        dosage: "180 mg once daily. Take with or without food.",
        sideEffects: [
            "Upper respiratory infection",
            "Muscle spasms",
            "Back pain",
            "Abdominal pain",
            "Anemia",
            "Increased liver enzymes"
        ],
        interactions: [
            { drug: "Simvastatin", level: "medium", description: "May increase simvastatin levels" },
            { drug: "Pravastatin", level: "medium", description: "May increase pravastatin levels" }
        ],
        safety: "Monitor uric acid levels as may cause hyperuricemia. Monitor for gout symptoms. Regular liver function tests recommended."
    },

    "Omega-3 acid ethyl esters": {
        class: "Omega-3 Fatty Acids",
        brandNames: "Lovaza, Omtryg",
        administration: "Oral",
        halfLife: "Not well characterized",
        uses: "Omega-3 acid ethyl esters are used to lower very high triglycerides in adults. They help reduce the risk of cardiovascular events in certain patients.",
        dosage: "4 grams daily taken as a single dose or 2 grams twice daily with food.",
        sideEffects: [
            "Fishy aftertaste",
            "Belching",
            "Upset stomach",
            "Change in sense of taste",
            "Rash",
            "Itching"
        ],
        interactions: [
            { drug: "Blood thinners", level: "medium", description: "May increase bleeding risk" },
            { drug: "Orlistat", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Take with meals to reduce gastrointestinal side effects. Monitor for bleeding if taking anticoagulants. May increase LDL cholesterol in some patients."
    },

    "Icosapent ethyl": {
        class: "Omega-3 Fatty Acid",
        brandNames: "Vascepa",
        administration: "Oral",
        halfLife: "Not well characterized",
        uses: "Icosapent ethyl is used to reduce cardiovascular risk in patients with elevated triglycerides and established cardiovascular disease or diabetes with other risk factors.",
        dosage: "4 grams daily taken as 2 grams twice daily with food.",
        sideEffects: [
            "Joint pain",
            "Swelling of hands/feet",
            "Constipation",
            "Gout",
            "Atrial fibrillation"
        ],
        interactions: [
            { drug: "Blood thinners", level: "medium", description: "May increase bleeding risk" }
        ],
        safety: "Take with food. Monitor for atrial fibrillation and bleeding events. Regular monitoring of triglycerides and liver function recommended."
    },
    "Warfarin": {
        class: "Vitamin K Antagonist",
        brandNames: "Coumadin, Jantoven",
        administration: "Oral",
        halfLife: "20-60 hours",
        uses: "Warfarin is used to prevent and treat blood clots in conditions like deep vein thrombosis, pulmonary embolism, and to prevent stroke in people with atrial fibrillation or artificial heart valves.",
        dosage: "Initial dose: 2-5 mg daily. Maintenance dose: Adjusted based on INR monitoring. Typical range 2-10 mg daily. Dosage must be individualized based on INR results.",
        sideEffects: [
            "Bleeding or bruising more easily",
            "Blood in urine or stools",
            "Heavy menstrual bleeding",
            "Headache",
            "Hair loss",
            "Skin necrosis (rare)"
        ],
        interactions: [
            { drug: "Aspirin", level: "high", description: "Increased risk of bleeding" },
            { drug: "NSAIDs", level: "high", description: "Increased risk of gastrointestinal bleeding" },
            { drug: "Antibiotics", level: "medium", description: "May increase warfarin effect" },
            { drug: "Vitamin K", level: "high", description: "Decreases warfarin effectiveness" }
        ],
        safety: "Requires regular INR monitoring. Many drug and food interactions. Avoid in pregnancy - can cause birth defects. Carry identification indicating warfarin use."
    },
    "Heparin": {
        class: "Unfractionated Heparin",
        brandNames: "Heparin Sodium",
        administration: "Intravenous, Subcutaneous",
        halfLife: "1-2 hours",
        uses: "Heparin is used to prevent and treat blood clots in veins, arteries, or lungs. It is also used during heart attacks, open-heart surgery, and dialysis.",
        dosage: "IV: Initial bolus 80 units/kg, then 18 units/kg/hour. Subcutaneous: 5,000 units every 8-12 hours. Dosage adjusted based on aPTT monitoring.",
        sideEffects: [
            "Bleeding or bruising",
            "Pain at injection site",
            "Thrombocytopenia",
            "Elevated liver enzymes",
            "Osteoporosis with long-term use",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "Anti-platelet drugs", level: "high", description: "Increased bleeding risk" },
            { drug: "Digoxin", level: "low", description: "May decrease digoxin levels" },
            { drug: "Antihistamines", level: "medium", description: "May decrease anticoagulant effect" }
        ],
        safety: "Monitor aPTT regularly. Risk of heparin-induced thrombocytopenia (HIT). Protamine sulfate is the antidote for overdose."
    },
    "Enoxaparin": {
        class: "Low Molecular Weight Heparin",
        brandNames: "Lovenox",
        administration: "Subcutaneous",
        halfLife: "4.5-7 hours",
        uses: "Enoxaparin is used to prevent and treat deep vein thrombosis (DVT) and pulmonary embolism (PE). Also used in unstable angina and non-Q-wave myocardial infarction.",
        dosage: "DVT prophylaxis: 40 mg once daily. DVT treatment: 1 mg/kg every 12 hours. Adjust dose for renal impairment.",
        sideEffects: [
            "Bleeding or bruising",
            "Pain at injection site",
            "Thrombocytopenia",
            "Fever",
            "Nausea",
            "Anemia"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "NSAIDs", level: "high", description: "Increased bleeding risk" },
            { drug: "Platelet inhibitors", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "Monitor platelet counts regularly. Use with caution in renal impairment. Not interchangeable with unfractionated heparin."
    },
    "Dabigatran": {
        class: "Direct Thrombin Inhibitor",
        brandNames: "Pradaxa",
        administration: "Oral",
        halfLife: "12-17 hours",
        uses: "Dabigatran is used to reduce the risk of stroke and blood clots in people with atrial fibrillation, and to treat and prevent deep vein thrombosis and pulmonary embolism.",
        dosage: "Atrial fibrillation: 150 mg twice daily. DVT/PE treatment: 150 mg twice daily after 5-10 days of parenteral anticoagulant.",
        sideEffects: [
            "Bleeding",
            "Gastrointestinal symptoms",
            "Dyspepsia",
            "Abdominal pain",
            "Nausea",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Rifampin", level: "high", description: "Decreases dabigatran levels" },
            { drug: "Ketoconazole", level: "high", description: "Increases dabigatran levels" },
            { drug: "P-gp inducers", level: "medium", description: "May decrease effectiveness" },
            { drug: "P-gp inhibitors", level: "medium", description: "May increase bleeding risk" }
        ],
        safety: "No routine coagulation monitoring required. Idarucizumab is the specific reversal agent. Risk of spinal hematoma with neuraxial anesthesia."
    },
    "Rivaroxaban": {
        class: "Factor Xa Inhibitor",
        brandNames: "Xarelto",
        administration: "Oral",
        halfLife: "5-9 hours (young), 11-13 hours (elderly)",
        uses: "Rivaroxaban is used to reduce the risk of stroke in atrial fibrillation, treat and prevent DVT and PE, and for thromboprophylaxis after hip or knee replacement surgery.",
        dosage: "Atrial fibrillation: 20 mg once daily with evening meal. DVT/PE treatment: 15 mg twice daily for 21 days, then 20 mg once daily.",
        sideEffects: [
            "Bleeding",
            "Back pain",
            "Itching",
            "Muscle spasms",
            "Elevated liver enzymes",
            "Fatigue"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increased bleeding risk" },
            { drug: "Strong CYP3A4 inducers", level: "high", description: "Decreased effectiveness" },
            { drug: "NSAIDs", level: "medium", description: "Increased bleeding risk" },
            { drug: "Aspirin", level: "medium", description: "Increased bleeding risk" }
        ],
        safety: "Take with food to improve absorption. Use with caution in renal impairment. Andexanet alfa is the reversal agent."
    },
    "Apixaban": {
        class: "Factor Xa Inhibitor",
        brandNames: "Eliquis",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Apixaban is used to reduce the risk of stroke in atrial fibrillation, treat and prevent DVT and PE, and for thromboprophylaxis after hip or knee replacement surgery.",
        dosage: "Atrial fibrillation: 5 mg twice daily. DVT/PE treatment: 10 mg twice daily for 7 days, then 5 mg twice daily. Reduce dose in patients with certain characteristics.",
        sideEffects: [
            "Bleeding",
            "Nausea",
            "Anemia",
            "Rash",
            "Elevated liver enzymes",
            "Headache"
        ],
        interactions: [
            { drug: "Strong CYP3A4/P-gp inhibitors", level: "high", description: "Increased bleeding risk" },
            { drug: "Strong CYP3A4/P-gp inducers", level: "high", description: "Decreased effectiveness" },
            { drug: "Anticoagulants", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "No routine monitoring required. Andexanet alfa is the reversal agent. Use with caution in severe renal impairment."
    },
    "Edoxaban": {
        class: "Factor Xa Inhibitor",
        brandNames: "Savaysa, Lixiana",
        administration: "Oral",
        halfLife: "10-14 hours",
        uses: "Edoxaban is used to reduce the risk of stroke in atrial fibrillation and to treat deep vein thrombosis and pulmonary embolism.",
        dosage: "Atrial fibrillation: 60 mg once daily. DVT/PE treatment: 60 mg once daily after 5-10 days of parenteral anticoagulant. Reduce to 30 mg in certain patients.",
        sideEffects: [
            "Bleeding",
            "Rash",
            "Abnormal liver function tests",
            "Anemia",
            "Nausea",
            "Headache"
        ],
        interactions: [
            { drug: "P-gp inhibitors", level: "high", description: "Increased bleeding risk" },
            { drug: "Rifampin", level: "medium", description: "Decreased effectiveness" },
            { drug: "Anticoagulants", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "Not recommended in patients with CrCl >95 mL/min due to increased stroke risk. Andexanet alfa is the reversal agent."
    },
    "Fondaparinux": {
        class: "Selective Factor Xa Inhibitor",
        brandNames: "Arixtra",
        administration: "Subcutaneous",
        halfLife: "17-21 hours",
        uses: "Fondaparinux is used to prevent and treat deep vein thrombosis and pulmonary embolism, particularly after hip fracture, hip replacement, or knee replacement surgery.",
        dosage: "DVT prophylaxis: 2.5 mg once daily. DVT/PE treatment: <50 kg: 5 mg; 50-100 kg: 7.5 mg; >100 kg: 10 mg once daily.",
        sideEffects: [
            "Bleeding",
            "Anemia",
            "Fever",
            "Nausea",
            "Edema",
            "Insomnia"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "Platelet inhibitors", level: "high", description: "Increased bleeding risk" },
            { drug: "NSAIDs", level: "medium", description: "Increased bleeding risk" }
        ],
        safety: "Contraindicated in severe renal impairment. No specific antidote. Monitor platelet counts for thrombocytopenia."
    },
    "Argatroban": {
        class: "Direct Thrombin Inhibitor",
        brandNames: "Argatroban",
        administration: "Intravenous",
        halfLife: "39-51 minutes",
        uses: "Argatroban is used as an anticoagulant for prophylaxis or treatment of thrombosis in patients with heparin-induced thrombocytopenia (HIT), and during percutaneous coronary interventions.",
        dosage: "HIT treatment: Initial 2 mcg/kg/min, adjust to aPTT 1.5-3 times baseline. PCI: 350 mcg/kg bolus, then 25 mcg/kg/min.",
        sideEffects: [
            "Bleeding",
            "Hypotension",
            "Fever",
            "Diarrhea",
            "Nausea",
            "Headache",
            "Cardiac arrest"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "Anti-platelet drugs", level: "high", description: "Increased bleeding risk" },
            { drug: "Thrombolytics", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "Monitor aPTT regularly. No specific antidote. Use with caution in hepatic impairment."
    },
    "Bivalirudin": {
        class: "Direct Thrombin Inhibitor",
        brandNames: "Angiomax",
        administration: "Intravenous",
        halfLife: "25 minutes",
        uses: "Bivalirudin is used as an anticoagulant in patients undergoing percutaneous coronary intervention (PCI), including those with heparin-induced thrombocytopenia.",
        dosage: "PCI: 0.75 mg/kg IV bolus, then 1.75 mg/kg/hour infusion for duration of procedure. May continue for up to 4 hours post-procedure.",
        sideEffects: [
            "Bleeding",
            "Hypotension",
            "Headache",
            "Nausea",
            "Back pain",
            "Insomnia",
            "Anxiety"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "Glycoprotein IIb/IIIa inhibitors", level: "high", description: "Increased bleeding risk" },
            { drug: "Thrombolytics", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "Monitor ACT during procedure. No specific antidote. Use with caution in renal impairment."
    },
    "Danaparoid": {
        class: "Heparinoid",
        brandNames: "Orgaran",
        administration: "Subcutaneous",
        halfLife: "24 hours",
        uses: "Danaparoid is used for prophylaxis of deep vein thrombosis and for treatment of heparin-induced thrombocytopenia (HIT).",
        dosage: "DVT prophylaxis: 750 units twice daily. HIT treatment: Loading dose 1250-2500 units, then 150-400 units/hour IV, or 750 units SC twice daily.",
        sideEffects: [
            "Bleeding",
            "Pain at injection site",
            "Skin reactions",
            "Fever",
            "Rash",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Other anticoagulants", level: "high", description: "Increased bleeding risk" },
            { drug: "Anti-platelet drugs", level: "high", description: "Increased bleeding risk" },
            { drug: "Thrombolytics", level: "high", description: "Increased bleeding risk" }
        ],
        safety: "Cross-reactivity with HIT antibodies may occur. Monitor anti-Xa levels. No specific antidote available."
    },
    "Acenocoumarol": {
        class: "Vitamin K Antagonist",
        brandNames: "Sintrom",
        administration: "Oral",
        halfLife: "8-11 hours",
        uses: "Acenocoumarol is used for prevention and treatment of thromboembolic disorders, including deep vein thrombosis, pulmonary embolism, and stroke prevention in atrial fibrillation.",
        dosage: "Initial dose: 2-4 mg daily. Maintenance: Adjusted based on INR monitoring, typically 1-8 mg daily. Highly variable between patients.",
        sideEffects: [
            "Bleeding",
            "Skin necrosis",
            "Purple toe syndrome",
            "Alopecia",
            "Rash",
            "Fever",
            "Nausea"
        ],
        interactions: [
            { drug: "Many antibiotics", level: "high", description: "Increased anticoagulant effect" },
            { drug: "Vitamin K", level: "high", description: "Decreased effectiveness" },
            { drug: "NSAIDs", level: "high", description: "Increased bleeding risk" },
            { drug: "Barbiturates", level: "medium", description: "Decreased effectiveness" }
        ],
        safety: "Requires frequent INR monitoring. Many drug and food interactions. Vitamin K is the antidote for overdose."
    },
    "Digoxin": {
        class: "Cardiac Glycoside",
        brandNames: "Lanoxin, Digitek",
        administration: "Oral, IV",
        halfLife: "36-48 hours",
        uses: "Digoxin is used to treat heart failure and atrial fibrillation. It helps the heart beat more strongly and regularly.",
        dosage: "Loading dose: 0.5-1 mg in divided doses over 24 hours. Maintenance: 0.125-0.5 mg daily. Dose must be individualized based on renal function.",
        sideEffects: [
            "Nausea and vomiting",
            "Loss of appetite",
            "Visual disturbances (yellow-green halos)",
            "Confusion",
            "Headache",
            "Fatigue"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "May cause hypokalemia and increase digoxin toxicity" },
            { drug: "Amiodarone", level: "high", description: "Increases digoxin levels" },
            { drug: "Verapamil", level: "high", description: "Increases digoxin levels" },
            { drug: "Quinidine", level: "high", description: "Increases digoxin levels" }
        ],
        safety: "Narrow therapeutic index - requires regular monitoring of blood levels. Toxicity can be fatal. Watch for signs of toxicity especially in elderly and renal impairment."
    },

    "Sacubitril/Valsartan": {
        class: "ARNI (Angiotensin Receptor-Neprilysin Inhibitor)",
        brandNames: "Entresto",
        administration: "Oral",
        halfLife: "Sacubitril: 1.4 hours, Valsartan: 9.9 hours",
        uses: "Used to reduce the risk of cardiovascular death and hospitalization for heart failure in patients with chronic heart failure.",
        dosage: "Initial: 49/51 mg twice daily. Target: 97/103 mg twice daily. Must replace ACE inhibitor or ARB with 36-hour washout period.",
        sideEffects: [
            "Hypotension",
            "Hyperkalemia",
            "Cough",
            "Dizziness",
            "Renal impairment"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Contraindicated - increased risk of angioedema" },
            { drug: "Potassium-sparing diuretics", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect and worsen renal function" },
            { drug: "Lithium", level: "high", description: "May increase lithium levels" }
        ],
        safety: "Contraindicated with ACE inhibitors. Do not use during pregnancy. Monitor serum potassium and renal function regularly."
    },

    "Carvedilol": {
        class: "Beta-Blocker with Alpha-1 Blocking Activity",
        brandNames: "Coreg, Coreg CR",
        administration: "Oral",
        halfLife: "7-10 hours",
        uses: "Used for heart failure, hypertension, and left ventricular dysfunction following myocardial infarction.",
        dosage: "Heart failure: Start 3.125 mg twice daily, double dose every 2 weeks. Max: 25 mg twice daily (≤85 kg) or 50 mg twice daily (>85 kg).",
        sideEffects: [
            "Dizziness",
            "Fatigue",
            "Weight gain",
            "Bradycardia",
            "Hypotension",
            "Edema"
        ],
        interactions: [
            { drug: "Calcium channel blockers", level: "high", description: "Increased risk of bradycardia and AV block" },
            { drug: "Clonidine", level: "high", description: "Rebound hypertension if discontinued" },
            { drug: "Insulin", level: "medium", description: "May mask symptoms of hypoglycemia" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" }
        ],
        safety: "Do not abruptly discontinue. Use with caution in patients with asthma or COPD. May mask signs of hyperthyroidism and hypoglycemia."
    },

    "Bisoprolol": {
        class: "Beta-1 Selective Blocker",
        brandNames: "Zebeta, Monocor",
        administration: "Oral",
        halfLife: "9-12 hours",
        uses: "Used for hypertension and chronic heart failure. Helps control heart rate and blood pressure.",
        dosage: "Hypertension: 2.5-10 mg once daily. Heart failure: Start 1.25 mg once daily, increase gradually. Max: 10 mg daily.",
        sideEffects: [
            "Bradycardia",
            "Fatigue",
            "Dizziness",
            "Cold extremities",
            "Depression",
            "Sleep disturbances"
        ],
        interactions: [
            { drug: "Calcium channel blockers", level: "high", description: "Increased risk of bradycardia and heart block" },
            { drug: "Clonidine", level: "high", description: "Risk of rebound hypertension" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Insulin", level: "medium", description: "May mask hypoglycemia symptoms" }
        ],
        safety: "Do not stop abruptly - taper over 1-2 weeks. Use with caution in patients with diabetes, asthma, or peripheral vascular disease."
    },

    "Spironolactone": {
        class: "Potassium-Sparing Diuretic, Aldosterone Antagonist",
        brandNames: "Aldactone",
        administration: "Oral",
        halfLife: "13-24 hours",
        uses: "Used for heart failure, hypertension, edema, and primary hyperaldosteronism. Also used for hormonal acne and hirsutism in women.",
        dosage: "Edema: 25-200 mg daily. Hypertension: 25-50 mg daily. Heart failure: 12.5-25 mg daily. Max: 400 mg daily.",
        sideEffects: [
            "Hyperkalemia",
            "Gynecomastia (in males)",
            "Menstrual irregularities",
            "Breast tenderness",
            "Dizziness",
            "Headache"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "high", description: "Increased risk of renal impairment and hyperkalemia" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "Lithium", level: "medium", description: "May increase lithium levels" }
        ],
        safety: "Monitor potassium levels regularly. Contraindicated in anuria, acute renal insufficiency, or hyperkalemia. May cause endocrine effects with long-term use."
    },

    "Eplerenone": {
        class: "Selective Aldosterone Blocker",
        brandNames: "Inspra",
        administration: "Oral",
        halfLife: "4-6 hours",
        uses: "Used for heart failure after myocardial infarction and hypertension. More selective than spironolactone with fewer hormonal side effects.",
        dosage: "Heart failure: Start 25 mg once daily, increase to 50 mg once daily. Hypertension: 50-100 mg once daily. Max: 100 mg daily.",
        sideEffects: [
            "Hyperkalemia",
            "Dizziness",
            "Fatigue",
            "Diarrhea",
            "Cough",
            "Abdominal pain"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Significantly increased risk of hyperkalemia" },
            { drug: "Potassium supplements", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "high", description: "May reduce antihypertensive effect and increase hyperkalemia risk" },
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increased eplerenone levels" }
        ],
        safety: "Monitor potassium levels within first week and monthly thereafter. Contraindicated with potassium >5.5 mEq/L, severe renal impairment, or type 2 diabetes with microalbuminuria."
    },

    "Furosemide": {
        class: "Loop Diuretic",
        brandNames: "Lasix",
        administration: "Oral, IV, IM",
        halfLife: "2 hours",
        uses: "Used for edema associated with heart failure, liver cirrhosis, and renal disease. Also used for hypertension.",
        dosage: "Edema: 20-80 mg initially, may repeat in 6-8 hours. Max: 600 mg daily. Hypertension: 40 mg twice daily.",
        sideEffects: [
            "Dehydration",
            "Hypokalemia",
            "Hypotension",
            "Ototoxicity (with high doses)",
            "Hyperglycemia",
            "Increased uric acid"
        ],
        interactions: [
            { drug: "Aminoglycosides", level: "high", description: "Increased risk of ototoxicity" },
            { drug: "Lithium", level: "high", description: "May increase lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce diuretic effect" },
            { drug: "Digoxin", level: "medium", description: "Hypokalemia may increase digoxin toxicity" }
        ],
        safety: "Monitor electrolytes, renal function, and blood pressure. Risk of ototoxicity with rapid IV administration or high doses. May cause photosensitivity."
    },

    "Metolazone": {
        class: "Thiazide-like Diuretic",
        brandNames: "Zaroxolyn, Mykrox",
        administration: "Oral",
        halfLife: "14-20 hours",
        uses: "Used for edema and hypertension. Particularly effective in patients with renal impairment when combined with loop diuretics.",
        dosage: "Edema: 5-20 mg once daily. Hypertension: 2.5-5 mg once daily. Max: 20 mg daily.",
        sideEffects: [
            "Hypokalemia",
            "Hyponatremia",
            "Hypotension",
            "Hyperglycemia",
            "Hyperuricemia",
            "Dizziness"
        ],
        interactions: [
            { drug: "Other diuretics", level: "high", description: "Potentiated diuresis and electrolyte loss" },
            { drug: "Lithium", level: "high", description: "May increase lithium levels" },
            { drug: "NSAIDs", level: "medium", description: "May reduce antihypertensive effect" },
            { drug: "Digoxin", level: "medium", description: "Hypokalemia may increase digoxin toxicity" }
        ],
        safety: "Monitor electrolytes regularly, especially potassium. Use with caution in patients with renal or hepatic impairment. May exacerbate gout or diabetes."
    },

    "Ivabradine": {
        class: "Hyperpolarization-Activated Cyclic Nucleotide-Gated Channel Blocker",
        brandNames: "Corlanor, Procoralan",
        administration: "Oral",
        halfLife: "2 hours (11 hours with active metabolite)",
        uses: "Used to reduce hospitalization from worsening heart failure in patients with stable chronic heart failure. Reduces heart rate without affecting blood pressure.",
        dosage: "Start 5 mg twice daily. After 2 weeks, adjust based on heart rate. Max: 7.5 mg twice daily.",
        sideEffects: [
            "Bradycardia",
            "Luminous phenomena (visual brightness)",
            "Atrial fibrillation",
            "Headache",
            "Dizziness",
            "Hypertension"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Contraindicated - increases ivabradine levels" },
            { drug: "QT-prolonging drugs", level: "medium", description: "Increased risk of arrhythmias" },
            { drug: "Calcium channel blockers", level: "medium", description: "Additive bradycardia effect" },
            { drug: "Beta-blockers", level: "medium", description: "May be used together but monitor for excessive bradycardia" }
        ],
        safety: "Contraindicated with strong CYP3A4 inhibitors. Monitor heart rate - maintain resting heart rate >50 bpm. May cause visual disturbances that are usually transient."
    },
    "Fluoxetine": {
        class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        brandNames: "Prozac, Sarafem, Selfemra",
        administration: "Oral",
        halfLife: "4-6 days",
        uses: "Fluoxetine is used to treat major depressive disorder, obsessive-compulsive disorder, bulimia nervosa, panic disorder, and premenstrual dysphoric disorder.",
        dosage: "For depression: Initial dose 20 mg once daily in the morning. May increase after several weeks. Maximum dose 80 mg/day.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Insomnia",
            "Anxiety",
            "Drowsiness",
            "Decreased libido",
            "Dry mouth"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Triptans", level: "medium", description: "Increased risk of serotonin syndrome" },
            { drug: "NSAIDs", level: "medium", description: "Increased risk of bleeding" }
        ],
        safety: "Do not use with MAOIs or within 14 days of discontinuing MAOIs. Monitor for worsening depression or suicidal thoughts, especially in children and young adults."
    },

    "Sertraline": {
        class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        brandNames: "Zoloft",
        administration: "Oral",
        halfLife: "26 hours",
        uses: "Sertraline is used to treat major depressive disorder, obsessive-compulsive disorder, panic disorder, social anxiety disorder, post-traumatic stress disorder, and premenstrual dysphoric disorder.",
        dosage: "Initial dose 50 mg once daily. May increase gradually. Maximum dose 200 mg/day.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Insomnia",
            "Dizziness",
            "Fatigue",
            "Dry mouth",
            "Sexual dysfunction"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Pimozide", level: "high", description: "Contraindicated due to QT prolongation" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "Discontinue at least 14 days before starting MAOIs. Monitor for clinical worsening and suicide risk. May cause QT prolongation."
    },

    "Paroxetine": {
        class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        brandNames: "Paxil, Brisdelle",
        administration: "Oral",
        halfLife: "21 hours",
        uses: "Paroxetine is used to treat major depressive disorder, obsessive-compulsive disorder, panic disorder, social anxiety disorder, generalized anxiety disorder, and post-traumatic stress disorder.",
        dosage: "Initial dose 20 mg once daily. Maximum dose 50-60 mg/day depending on indication.",
        sideEffects: [
            "Nausea",
            "Somnolence",
            "Dry mouth",
            "Dizziness",
            "Sweating",
            "Sexual dysfunction",
            "Weight gain"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Thioridazine", level: "high", description: "Contraindicated due to QT prolongation" },
            { drug: "Tamoxifen", level: "medium", description: "May reduce tamoxifen effectiveness" }
        ],
        safety: "Associated with more withdrawal symptoms than other SSRIs. Taper gradually when discontinuing. Not recommended during pregnancy due to potential fetal risks."
    },

    "Citalopram": {
        class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        brandNames: "Celexa",
        administration: "Oral",
        halfLife: "35 hours",
        uses: "Citalopram is used to treat major depressive disorder. It may also be used off-label for other conditions.",
        dosage: "Initial dose 20 mg once daily. Maximum dose 40 mg/day (20 mg/day in patients with hepatic impairment or over 60 years).",
        sideEffects: [
            "Nausea",
            "Dry mouth",
            "Somnolence",
            "Insomnia",
            "Increased sweating",
            "Fatigue",
            "Sexual dysfunction"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of QT prolongation" },
            { drug: "Cimetidine", level: "medium", description: "May increase citalopram levels" }
        ],
        safety: "Dose-dependent QT interval prolongation. Maximum dose 40 mg/day. Use lower doses in elderly patients and those with hepatic impairment."
    },

    "Escitalopram": {
        class: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        brandNames: "Lexapro",
        administration: "Oral",
        halfLife: "27-32 hours",
        uses: "Escitalopram is used to treat major depressive disorder and generalized anxiety disorder.",
        dosage: "Initial dose 10 mg once daily. May increase to 20 mg/day after at least one week.",
        sideEffects: [
            "Nausea",
            "Insomnia",
            "Ejaculation disorder",
            "Fatigue",
            "Somnolence",
            "Increased sweating"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Aspirin", level: "medium", description: "Increased risk of bleeding" },
            { drug: "Linezolid", level: "high", description: "Risk of serotonin syndrome" }
        ],
        safety: "Generally better tolerated than citalopram with fewer drug interactions. Still requires caution with MAOIs and monitoring for suicidal thoughts."
    },

    "Venlafaxine": {
        class: "Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)",
        brandNames: "Effexor, Effexor XR",
        administration: "Oral",
        halfLife: "5 hours (11 hours for active metabolite)",
        uses: "Venlafaxine is used to treat major depressive disorder, generalized anxiety disorder, social anxiety disorder, and panic disorder.",
        dosage: "Immediate-release: 75 mg/day in 2-3 divided doses. Extended-release: 75 mg once daily. Maximum dose 225 mg/day.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Insomnia",
            "Dry mouth",
            "Dizziness",
            "Sweating",
            "Increased blood pressure"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Triptans", level: "medium", description: "Increased risk of serotonin syndrome" }
        ],
        safety: "Monitor blood pressure regularly. Associated with significant withdrawal symptoms; taper gradually. May increase risk of bleeding events."
    },

    "Duloxetine": {
        class: "Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)",
        brandNames: "Cymbalta, Irenka",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Duloxetine is used to treat major depressive disorder, generalized anxiety disorder, diabetic neuropathy, fibromyalgia, and chronic musculoskeletal pain.",
        dosage: "For depression: 40-60 mg/day. Starting dose typically 30 mg once daily for one week, then 60 mg once daily.",
        sideEffects: [
            "Nausea",
            "Dry mouth",
            "Fatigue",
            "Dizziness",
            "Constipation",
            "Decreased appetite",
            "Increased sweating"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Anticoagulants", level: "medium", description: "Increased risk of bleeding" },
            { drug: "CYP1A2 inhibitors", level: "medium", description: "May increase duloxetine levels" }
        ],
        safety: "May cause liver injury. Avoid in patients with substantial alcohol use or chronic liver disease. Taper gradually when discontinuing."
    },

    "Desvenlafaxine": {
        class: "Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)",
        brandNames: "Pristiq",
        administration: "Oral",
        halfLife: "11 hours",
        uses: "Desvenlafaxine is used to treat major depressive disorder.",
        dosage: "Recommended dose 50 mg once daily. Maximum dose 400 mg/day.",
        sideEffects: [
            "Nausea",
            "Dizziness",
            "Insomnia",
            "Hyperhidrosis",
            "Constipation",
            "Decreased appetite",
            "Anxiety"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Aspirin", level: "medium", description: "Increased risk of bleeding" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "Monitor blood pressure. May increase cholesterol levels. Taper gradually when discontinuing to avoid withdrawal symptoms."
    },

    "Bupropion": {
        class: "Atypical Antidepressant (NDRI)",
        brandNames: "Wellbutrin, Zyban",
        administration: "Oral",
        halfLife: "21 hours",
        uses: "Bupropion is used to treat major depressive disorder and seasonal affective disorder. Also used as smoking cessation aid.",
        dosage: "Initial dose 100 mg twice daily. Maximum dose 450 mg/day. Avoid single doses over 150 mg.",
        sideEffects: [
            "Dry mouth",
            "Insomnia",
            "Headache",
            "Nausea",
            "Constipation",
            "Anxiety",
            "Tremor"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Contraindicated" },
            { drug: "Other bupropion products", level: "high", description: "Do not use concurrently" },
            { drug: "CYP2B6 inhibitors", level: "medium", description: "May increase bupropion levels" }
        ],
        safety: "Contraindicated in patients with seizure disorder or eating disorders. Increased risk of seizures. May cause hypertension."
    },

    "Mirtazapine": {
        class: "Atypical Antidepressant (NaSSA)",
        brandNames: "Remeron",
        administration: "Oral",
        halfLife: "20-40 hours",
        uses: "Mirtazapine is used to treat major depressive disorder.",
        dosage: "Initial dose 15 mg once daily at bedtime. May increase to 45 mg/day.",
        sideEffects: [
            "Somnolence",
            "Increased appetite",
            "Weight gain",
            "Dizziness",
            "Dry mouth",
            "Constipation"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Benzodiazepines", level: "medium", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" }
        ],
        safety: "May cause agranulocytosis. Monitor for signs of infection. Significant weight gain common. Less sexual side effects than SSRIs."
    },

    "Amitriptyline": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Elavil",
        administration: "Oral",
        halfLife: "10-28 hours",
        uses: "Amitriptyline is used to treat depression. Also used for neuropathic pain, migraine prevention, and other chronic pain conditions.",
        dosage: "For depression: Initial dose 25-50 mg at bedtime. Maintenance dose 50-100 mg/day. Maximum dose 150 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Urinary retention",
            "Drowsiness",
            "Orthostatic hypotension",
            "Weight gain"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of arrhythmias" },
            { drug: "Anticholinergics", level: "medium", description: "Enhanced anticholinergic effects" }
        ],
        safety: "Overdose can be fatal. Use with caution in elderly patients. Monitor ECG in patients with cardiac risk factors. Gradual dose titration recommended."
    },

    "Nortriptyline": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Pamelor",
        administration: "Oral",
        halfLife: "18-44 hours",
        uses: "Nortriptyline is used to treat depression. Also used for chronic pain, migraine prevention, and smoking cessation.",
        dosage: "Initial dose 25 mg 3-4 times daily. Maintenance dose 75-100 mg/day. Maximum dose 150 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Constipation",
            "Blurred vision",
            "Dizziness",
            "Drowsiness",
            "Orthostatic hypotension"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Cimetidine", level: "medium", description: "May increase nortriptyline levels" },
            { drug: "Guanethidine", level: "medium", description: "May decrease antihypertensive effect" }
        ],
        safety: "Therapeutic drug monitoring recommended. Narrow therapeutic index. Use with caution in patients with cardiovascular disease."
    },

    "Imipramine": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Tofranil",
        administration: "Oral",
        halfLife: "11-25 hours",
        uses: "Imipramine is used to treat depression. Also used for childhood enuresis and panic disorder.",
        dosage: "Initial dose 75 mg/day. Maintenance dose 50-150 mg/day. Maximum dose 200 mg/day for outpatients.",
        sideEffects: [
            "Dry mouth",
            "Constipation",
            "Blurred vision",
            "Drowsiness",
            "Orthostatic hypotension",
            "Weight gain",
            "Sexual dysfunction"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Clonidine", level: "high", description: "May reduce antihypertensive effect" },
            { drug: "Sympathomimetics", level: "medium", description: "Increased cardiovascular effects" }
        ],
        safety: "May lower seizure threshold. Use with caution in patients with glaucoma, urinary retention, or cardiovascular disease. Monitor blood pressure."
    },

    "Clomipramine": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Anafranil",
        administration: "Oral",
        halfLife: "19-37 hours",
        uses: "Clomipramine is used primarily for obsessive-compulsive disorder. Also used for depression and other anxiety disorders.",
        dosage: "Initial dose 25 mg daily. Titrate to 100 mg/day during first 2 weeks. Maximum dose 250 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Dizziness",
            "Constipation",
            "Weight gain",
            "Sexual dysfunction",
            "Sweating",
            "Tremor"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Phenobarbital", level: "medium", description: "May decrease clomipramine levels" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "High incidence of anticholinergic side effects. Monitor for seizures. Requires gradual dose titration and gradual discontinuation."
    },

    "Doxepin": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Sinequan, Silenor",
        administration: "Oral",
        halfLife: "15 hours",
        uses: "Doxepin is used for depression and anxiety disorders. Low doses are used for insomnia.",
        dosage: "For depression: 75-150 mg/day. For insomnia: 3-6 mg at bedtime.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Weight gain",
            "Urinary retention"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Cimetidine", level: "medium", description: "May increase doxepin levels" }
        ],
        safety: "Highly sedating. Use lower doses for insomnia. Avoid in patients with glaucoma or urinary retention. Overdose can be fatal."
    },

    "Maprotiline": {
        class: "Tetracyclic Antidepressant",
        brandNames: "Ludiomil",
        administration: "Oral",
        halfLife: "27-58 hours",
        uses: "Maprotiline is used to treat depression and anxiety associated with depression.",
        dosage: "Initial dose 75 mg/day. Maintenance dose 75-150 mg/day. Maximum dose 225 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Constipation",
            "Blurred vision",
            "Dizziness",
            "Skin rash"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of arrhythmias" },
            { drug: "Anticholinergics", level: "medium", description: "Enhanced anticholinergic effects" }
        ],
        safety: "Higher risk of seizures compared to other antidepressants. Use with caution in patients with seizure disorders. Gradual dose titration recommended."
    },

    "Trazodone": {
        class: "Serotonin Antagonist and Reuptake Inhibitor (SARI)",
        brandNames: "Desyrel",
        administration: "Oral",
        halfLife: "5-9 hours",
        uses: "Trazodone is used to treat major depressive disorder. Often used off-label for insomnia.",
        dosage: "For depression: 150 mg/day in divided doses. Maximum dose 400 mg/day for outpatients.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Dry mouth",
            "Nausea",
            "Headache",
            "Blurred vision",
            "Priapism (rare but serious)"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" }
        ],
        safety: "Risk of priapism (prolonged erection). Discontinue if priapism occurs. Highly sedating; often used for insomnia at lower doses."
    },

    "Nefazodone": {
        class: "Serotonin Antagonist and Reuptake Inhibitor (SARI)",
        brandNames: "Serzone",
        administration: "Oral",
        halfLife: "2-4 hours",
        uses: "Nefazodone is used to treat major depressive disorder.",
        dosage: "Initial dose 100 mg twice daily. Maintenance dose 300-600 mg/day in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Nausea",
            "Dizziness",
            "Constipation",
            "Blurred vision"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Pimozide", level: "high", description: "Contraindicated" },
            { drug: "Carbamazepine", level: "medium", description: "May decrease nefazodone levels" }
        ],
        safety: "Black box warning for hepatotoxicity. Liver function monitoring required. Less sexual side effects than SSRIs."
    },

    "Vilazodone": {
        class: "Serotonin Partial Agonist and Reuptake Inhibitor (SPARI)",
        brandNames: "Viibryd",
        administration: "Oral",
        halfLife: "25 hours",
        uses: "Vilazodone is used to treat major depressive disorder.",
        dosage: "Initial dose 10 mg once daily for 7 days, then 20 mg once daily for 7 days, then 40 mg once daily.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Insomnia",
            "Vomiting",
            "Dizziness",
            "Dry mouth"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Aspirin", level: "medium", description: "Increased risk of bleeding" },
            { drug: "Strong CYP3A4 inhibitors", level: "medium", description: "May increase vilazodone levels" }
        ],
        safety: "Must be taken with food to ensure adequate absorption. Monitor for diarrhea and gastrointestinal side effects."
    },

    "Vortioxetine": {
        class: "Multimodal Antidepressant",
        brandNames: "Trintellix, Brintellix",
        administration: "Oral",
        halfLife: "66 hours",
        uses: "Vortioxetine is used to treat major depressive disorder.",
        dosage: "Initial dose 10 mg once daily. May increase to 20 mg/day. Maximum dose 20 mg/day.",
        sideEffects: [
            "Nausea",
            "Constipation",
            "Vomiting",
            "Sexual dysfunction",
            "Dizziness",
            "Itching"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "NSAIDs", level: "medium", description: "Increased risk of bleeding" },
            { drug: "Strong CYP2D6 inhibitors", level: "medium", description: "May increase vortioxetine levels" }
        ],
        safety: "May cause less sexual dysfunction than SSRIs. Monitor for nausea, especially during initial treatment."
    },

    "Phenelzine": {
        class: "Monoamine Oxidase Inhibitor (MAOI)",
        brandNames: "Nardil",
        administration: "Oral",
        halfLife: "1.5-4 hours",
        uses: "Phenelzine is used for atypical depression and treatment-resistant depression.",
        dosage: "Initial dose 15 mg three times daily. Maximum dose 90 mg/day.",
        sideEffects: [
            "Orthostatic hypotension",
            "Dizziness",
            "Headache",
            "Dry mouth",
            "Constipation",
            "Weight gain",
            "Sedation"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Tyramine-rich foods", level: "high", description: "Risk of hypertensive crisis" },
            { drug: "Sympathomimetics", level: "high", description: "Risk of hypertensive crisis" }
        ],
        safety: "Requires strict dietary restrictions to avoid tyramine-containing foods. Washout period of 2 weeks needed when switching from other antidepressants."
    },

    "Tranylcypromine": {
        class: "Monoamine Oxidase Inhibitor (MAOI)",
        brandNames: "Parnate",
        administration: "Oral",
        halfLife: "2.5 hours",
        uses: "Tranylcypromine is used for atypical depression and treatment-resistant depression.",
        dosage: "Initial dose 10 mg twice daily. Maximum dose 60 mg/day.",
        sideEffects: [
            "Orthostatic hypotension",
            "Insomnia",
            "Dizziness",
            "Headache",
            "Dry mouth",
            "Constipation"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Tyramine-rich foods", level: "high", description: "Risk of hypertensive crisis" },
            { drug: "Meperidine", level: "high", description: "Risk of serotonin syndrome" }
        ],
        safety: "Strict dietary restrictions required. May cause stimulant-like effects. Monitor for hypertensive crises."
    },

    "Isocarboxazid": {
        class: "Monoamine Oxidase Inhibitor (MAOI)",
        brandNames: "Marplan",
        administration: "Oral",
        halfLife: "Not well characterized",
        uses: "Isocarboxazid is used for depression when other treatments have failed.",
        dosage: "Initial dose 10 mg twice daily. Maximum dose 60 mg/day.",
        sideEffects: [
            "Orthostatic hypotension",
            "Dizziness",
            "Headache",
            "Dry mouth",
            "Constipation",
            "Weight gain"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Tyramine-rich foods", level: "high", description: "Risk of hypertensive crisis" },
            { drug: "TCAs", level: "high", description: "Risk of serotonin syndrome" }
        ],
        safety: "Requires dietary restrictions. Use only when other antidepressants have failed due to significant interaction risks."
    },

    "Selegiline": {
        class: "Monoamine Oxidase Inhibitor (MAOI)",
        brandNames: "Emsam, Eldepryl",
        administration: "Transdermal, Oral",
        halfLife: "10 hours",
        uses: "Transdermal selegiline is used for major depressive disorder. Oral form used for Parkinson's disease.",
        dosage: "Transdermal: 6 mg/24 hours. Maximum 12 mg/24 hours.",
        sideEffects: [
            "Application site reaction",
            "Headache",
            "Insomnia",
            "Dry mouth",
            "Dizziness"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Tyramine-rich foods", level: "medium", description: "Lower risk with transdermal at doses ≤ 6 mg/24h" },
            { drug: "Meperidine", level: "high", description: "Contraindicated" }
        ],
        safety: "Transdermal form has fewer dietary restrictions at lower doses. Still requires caution with drug interactions."
    },

    "Moclobemide": {
        class: "Reversible Inhibitor of Monoamine Oxidase A (RIMA)",
        brandNames: "Aurorix, Manerix",
        administration: "Oral",
        halfLife: "1-2 hours",
        uses: "Moclobemide is used to treat depression and social anxiety disorder.",
        dosage: "Initial dose 300 mg/day in divided doses. Maximum dose 600 mg/day.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Dizziness",
            "Insomnia",
            "Agitation",
            "Dry mouth"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Tyramine-rich foods", level: "low", description: "Minimal risk with normal dietary tyramine" },
            { drug: "Cimetidine", level: "medium", description: "May increase moclobemide levels" }
        ],
        safety: "Fewer dietary restrictions than traditional MAOIs. Still requires washout period when switching from other antidepressants."
    },

    "Agomelatine": {
        class: "Melatonin Receptor Agonist and Serotonin Antagonist",
        brandNames: "Valdoxan",
        administration: "Oral",
        halfLife: "1-2 hours",
        uses: "Agomelatine is used to treat major depressive disorder.",
        dosage: "Recommended dose 25 mg once daily at bedtime. May increase to 50 mg once daily after 2 weeks.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Nausea",
            "Somnolence",
            "Insomnia",
            "Fatigue"
        ],
        interactions: [
            { drug: "Strong CYP1A2 inhibitors", level: "high", description: "Contraindicated" },
            { drug: "Alcohol", level: "medium", description: "May enhance adverse effects" },
            { drug: "Fluvoxamine", level: "high", description: "Contraindicated" }
        ],
        safety: "Monitor liver function tests regularly. Contraindicated in patients with hepatic impairment. May improve sleep-wake cycle."
    },

    "Reboxetine": {
        class: "Selective Norepinephrine Reuptake Inhibitor (NRI)",
        brandNames: "Edronax",
        administration: "Oral",
        halfLife: "13 hours",
        uses: "Reboxetine is used to treat depression.",
        dosage: "Initial dose 4 mg twice daily. Maximum dose 10 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Constipation",
            "Insomnia",
            "Sweating",
            "Dizziness",
            "Urinary hesitancy"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Ketoconazole", level: "medium", description: "May increase reboxetine levels" },
            { drug: "Macrolide antibiotics", level: "medium", description: "May increase reboxetine levels" }
        ],
        safety: "May cause urinary retention. Use with caution in elderly men with prostatic hypertrophy. Monitor for hypertension."
    },

    "Milnacipran": {
        class: "Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)",
        brandNames: "Savella",
        administration: "Oral",
        halfLife: "6-8 hours",
        uses: "Milnacipran is used for fibromyalgia. Also used for depression in some countries.",
        dosage: "Initial dose 12.5 mg once, then 12.5 mg twice daily. Titrate to 50 mg twice daily.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Constipation",
            "Dizziness",
            "Insomnia",
            "Hot flush",
            "Hyperhidrosis"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Epinephrine", level: "medium", description: "May potentiate cardiovascular effects" },
            { drug: "Clonidine", level: "medium", description: "May reduce antihypertensive effect" }
        ],
        safety: "Monitor blood pressure and heart rate. May increase liver enzymes. Use with caution in patients with hepatic or renal impairment."
    },

    "Levomilnacipran": {
        class: "Serotonin-Norepinephrine Reuptake Inhibitor (SNRI)",
        brandNames: "Fetzima",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Levomilnacipran is used to treat major depressive disorder.",
        dosage: "Initial dose 20 mg once daily for 2 days, then 40 mg once daily. Maximum dose 120 mg/day.",
        sideEffects: [
            "Nausea",
            "Constipation",
            "Hyperhidrosis",
            "Tachycardia",
            "Erectile dysfunction",
            "Increased heart rate"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Aspirin", level: "medium", description: "Increased risk of bleeding" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "Monitor blood pressure and heart rate. May cause urinary hesitation or retention. Use with caution in patients with cardiovascular disease."
    },

    "Dothiepin": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Prothiaden",
        administration: "Oral",
        halfLife: "14-24 hours",
        uses: "Dothiepin is used to treat depression and anxiety.",
        dosage: "Initial dose 75 mg/day. Maintenance dose 75-150 mg/day. Maximum dose 225 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Drowsiness",
            "Constipation",
            "Blurred vision",
            "Dizziness",
            "Weight gain"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Anticholinergics", level: "medium", description: "Enhanced anticholinergic effects" }
        ],
        safety: "Sedating TCA, often used when sedation is desired. Overdose can be fatal. Use with caution in elderly patients."
    },

    "Trimipramine": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Surmontil",
        administration: "Oral",
        halfLife: "16-40 hours",
        uses: "Trimipramine is used to treat depression.",
        dosage: "Initial dose 75 mg/day. Maintenance dose 50-150 mg/day. Maximum dose 200 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Weight gain",
            "Orthostatic hypotension"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of arrhythmias" },
            { drug: "Clonidine", level: "medium", description: "May reduce antihypertensive effect" }
        ],
        safety: "Highly sedating. Useful when sedation is desired. Monitor for orthostatic hypotension, especially in elderly patients."
    },

    "Protriptyline": {
        class: "Tricyclic Antidepressant (TCA)",
        brandNames: "Vivactil",
        administration: "Oral",
        halfLife: "54-92 hours",
        uses: "Protriptyline is used to treat depression. Also used for narcolepsy and cataplexy.",
        dosage: "Initial dose 15-40 mg/day in divided doses. Maximum dose 60 mg/day.",
        sideEffects: [
            "Insomnia",
            "Anxiety",
            "Agitation",
            "Dry mouth",
            "Constipation",
            "Urinary retention"
        ],
        interactions: [
            { drug: "MAOIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Sympathomimetics", level: "medium", description: "Increased cardiovascular effects" },
            { drug: "Cimetidine", level: "medium", description: "May increase protriptyline levels" }
        ],
        safety: "Activating TCA, may cause insomnia. Use with caution in patients with cardiovascular disease. Monitor for anticholinergic side effects."
    },
    "Diazepam": {
        class: "Benzodiazepine",
        brandNames: "Valium, Diastat",
        administration: "Oral, IV, IM, Rectal",
        halfLife: "20-50 hours",
        uses: "Diazepam is used to treat anxiety disorders, alcohol withdrawal symptoms, or muscle spasms. It may also be used to treat certain types of seizures.",
        dosage: "For anxiety: 2-10 mg 2-4 times daily. For muscle spasms: 2-10 mg 3-4 times daily. Maximum daily dose: 40 mg.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Fatigue",
            "Muscle weakness",
            "Memory problems",
            "Slurred speech"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression and respiratory depression" },
            { drug: "Opioids", level: "high", description: "Profound sedation, respiratory depression, coma" },
            { drug: "Other benzodiazepines", level: "high", description: "Additive CNS depression" },
            { drug: "Antidepressants", level: "medium", description: "Increased sedation" }
        ],
        safety: "Risk of dependence and withdrawal symptoms with long-term use. Avoid abrupt discontinuation. Not recommended for elderly patients due to fall risk."
    },

    "Lorazepam": {
        class: "Benzodiazepine",
        brandNames: "Ativan",
        administration: "Oral, IV, IM",
        halfLife: "10-20 hours",
        uses: "Lorazepam is used for the management of anxiety disorders, short-term relief of anxiety symptoms, and pre-anesthetic medication.",
        dosage: "For anxiety: 2-3 mg daily in divided doses. Maximum daily dose: 10 mg. For insomnia: 2-4 mg at bedtime.",
        sideEffects: [
            "Sedation",
            "Dizziness",
            "Weakness",
            "Unsteadiness",
            "Memory impairment",
            "Headache"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression and sedation" },
            { drug: "Clozapine", level: "high", description: "Risk of respiratory depression" },
            { drug: "Probenecid", level: "medium", description: "Increased lorazepam levels" }
        ],
        safety: "May cause physical and psychological dependence. Withdrawal symptoms can occur after prolonged use. Use with caution in patients with respiratory conditions."
    },

    "Alprazolam": {
        class: "Benzodiazepine",
        brandNames: "Xanax, Xanax XR",
        administration: "Oral",
        halfLife: "11-16 hours",
        uses: "Alprazolam is used to treat anxiety and panic disorders. It may also be used for premenstrual syndrome and depression.",
        dosage: "For anxiety: 0.25-0.5 mg three times daily. Maximum daily dose: 4 mg. For panic disorder: 1-10 mg daily in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Light-headedness",
            "Headache",
            "Dry mouth",
            "Constipation",
            "Changes in appetite"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Ketoconazole", level: "high", description: "Significantly increased alprazolam levels" },
            { drug: "Cimetidine", level: "medium", description: "Increased alprazolam concentrations" },
            { drug: "Oral contraceptives", level: "medium", description: "Increased alprazolam levels" }
        ],
        safety: "High potential for abuse and dependence. Withdrawal symptoms can be severe. Do not stop abruptly after long-term use."
    },

    "Clonazepam": {
        class: "Benzodiazepine",
        brandNames: "Klonopin",
        administration: "Oral",
        halfLife: "30-40 hours",
        uses: "Clonazepam is used to treat seizure disorders and panic disorder. It may also be used for restless legs syndrome.",
        dosage: "For panic disorder: 0.25 mg twice daily, increased to 1 mg daily. Maximum daily dose: 4 mg. For seizures: 1.5 mg daily in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Coordination problems",
            "Depression",
            "Memory problems",
            "Fatigue",
            "Dizziness"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Phenobarbital", level: "medium", description: "Increased sedation" },
            { drug: "Valproic acid", level: "medium", description: "May increase clonazepam levels" }
        ],
        safety: "Risk of tolerance and dependence. Withdrawal symptoms may occur after discontinuation. Use with caution in patients with liver disease."
    },

    "Oxazepam": {
        class: "Benzodiazepine",
        brandNames: "Serax",
        administration: "Oral",
        halfLife: "5-15 hours",
        uses: "Oxazepam is used for the management of anxiety disorders, anxiety associated with depression, and alcohol withdrawal.",
        dosage: "For mild to moderate anxiety: 10-15 mg 3-4 times daily. For severe anxiety: 15-30 mg 3-4 times daily. Maximum daily dose: 120 mg.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Headache",
            "Vertigo",
            "Syncope",
            "Slurred speech"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Disulfiram", level: "medium", description: "Increased oxazepam effects" },
            { drug: "Probenecid", level: "medium", description: "May increase oxazepam levels" },
            { drug: "Theophylline", level: "medium", description: "May decrease oxazepam effectiveness" }
        ],
        safety: "Preferred in elderly patients due to shorter half-life. Lower risk of accumulation. Still has potential for dependence."
    },

    "Chlordiazepoxide": {
        class: "Benzodiazepine",
        brandNames: "Librium",
        administration: "Oral, IM, IV",
        halfLife: "5-30 hours",
        uses: "Chlordiazepoxide is used for the management of anxiety disorders, alcohol withdrawal symptoms, and pre-operative apprehension.",
        dosage: "For mild to moderate anxiety: 5-10 mg 3-4 times daily. For severe anxiety: 20-25 mg 3-4 times daily. For alcohol withdrawal: 50-100 mg initially.",
        sideEffects: [
            "Drowsiness",
            "Confusion",
            "Ataxia",
            "Hypotension",
            "Changes in libido",
            "Jaundice"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Cimetidine", level: "medium", description: "Increased chlordiazepoxide levels" },
            { drug: "Disulfiram", level: "medium", description: "Increased sedative effects" },
            { drug: "Levodopa", level: "medium", description: "Reduced therapeutic effect" }
        ],
        safety: "One of the first benzodiazepines developed. High risk of dependence with long-term use. Monitor liver function during therapy."
    },

    "Buspirone": {
        class: "Azapirone",
        brandNames: "Buspar",
        administration: "Oral",
        halfLife: "2-3 hours",
        uses: "Buspirone is used for the management of anxiety disorders. It may take several weeks to show full therapeutic effect.",
        dosage: "Initial dose: 7.5 mg twice daily. May increase by 5 mg daily every 2-3 days. Maximum daily dose: 60 mg.",
        sideEffects: [
            "Dizziness",
            "Headache",
            "Nausea",
            "Nervousness",
            "Lightheadedness",
            "Excitement"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Risk of hypertension" },
            { drug: "Grapefruit juice", level: "medium", description: "Increased buspirone levels" },
            { drug: "Diltiazem", level: "medium", description: "Increased buspirone concentrations" },
            { drug: "Verapamil", level: "medium", description: "Increased buspirone levels" }
        ],
        safety: "Not addictive like benzodiazepines. Does not cause sedation or cognitive impairment. Takes 2-4 weeks to show full effect."
    },

    "Hydroxyzine": {
        class: "Antihistamine",
        brandNames: "Vistaril, Atarax",
        administration: "Oral, IM",
        halfLife: "3-7 hours",
        uses: "Hydroxyzine is used for the treatment of anxiety, tension, pruritus, and as pre-operative sedation.",
        dosage: "For anxiety: 50-100 mg 4 times daily. Maximum daily dose: 400 mg. For pruritus: 25 mg 3-4 times daily.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Headache",
            "Dizziness",
            "Blurred vision",
            "Constipation"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Additive sedation" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased anticholinergic effects" },
            { drug: "Anticholinergics", level: "medium", description: "Enhanced side effects" }
        ],
        safety: "Less risk of dependence compared to benzodiazepines. May cause QT prolongation. Use with caution in elderly patients."
    },

    "Propranolol": {
        class: "Beta-blocker",
        brandNames: "Inderal, InnoPran XL",
        administration: "Oral, IV",
        halfLife: "3-6 hours",
        uses: "Propranolol is used for performance anxiety, essential tremor, hypertension, angina, and migraine prevention.",
        dosage: "For anxiety: 10-40 mg 3-4 times daily. For migraine: 80-240 mg daily in divided doses. Maximum daily dose: 320 mg.",
        sideEffects: [
            "Fatigue",
            "Dizziness",
            "Cold extremities",
            "Bradycardia",
            "Depression",
            "Insomnia"
        ],
        interactions: [
            { drug: "Calcium channel blockers", level: "high", description: "Severe bradycardia and heart block" },
            { drug: "Insulin", level: "high", description: "Masked hypoglycemia symptoms" },
            { drug: "Theophylline", level: "medium", description: "Mutual inhibition of effects" },
            { drug: "NSAIDs", level: "medium", description: "Reduced antihypertensive effect" }
        ],
        safety: "Do not stop abruptly - may cause rebound hypertension. Contraindicated in asthma, severe COPD, and heart block."
    },

    "Pregabalin": {
        class: "Gabapentinoid",
        brandNames: "Lyrica",
        administration: "Oral",
        halfLife: "6.3 hours",
        uses: "Pregabalin is used for neuropathic pain, fibromyalgia, and generalized anxiety disorder.",
        dosage: "For anxiety: 150-600 mg daily in 2-3 divided doses. Maximum daily dose: 600 mg. Start with 150 mg daily.",
        sideEffects: [
            "Dizziness",
            "Somnolence",
            "Dry mouth",
            "Edema",
            "Blurred vision",
            "Weight gain"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Additive CNS depression" },
            { drug: "Alcohol", level: "high", description: "Increased dizziness and drowsiness" },
            { drug: "Thiazolidinediones", level: "medium", description: "May enhance fluid retention" },
            { drug: "ACE inhibitors", level: "medium", description: "Increased risk of angioedema" }
        ],
        safety: "May cause dependence and withdrawal symptoms. Requires gradual dose reduction when discontinuing. Monitor for edema and weight gain."
    },

    "Gabapentin": {
        class: "Gabapentinoid",
        brandNames: "Neurontin, Gralise",
        administration: "Oral",
        halfLife: "5-7 hours",
        uses: "Gabapentin is used for neuropathic pain, seizures, and sometimes for anxiety disorders.",
        dosage: "For anxiety: 300-1200 mg three times daily. Maximum daily dose: 3600 mg. Start with 300 mg three times daily.",
        sideEffects: [
            "Dizziness",
            "Fatigue",
            "Drowsiness",
            "Peripheral edema",
            "Ataxia",
            "Nystagmus"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedation" },
            { drug: "Antacids", level: "medium", description: "Reduced gabapentin absorption" },
            { drug: "Morphine", level: "medium", description: "Increased gabapentin concentrations" },
            { drug: "Alcohol", level: "medium", description: "Enhanced CNS depression" }
        ],
        safety: "Requires renal dose adjustment. Withdrawal symptoms may occur with abrupt discontinuation. May cause suicidal thoughts."
    },

    "Etifoxine": {
        class: "Non-benzodiazepine anxiolytic",
        brandNames: "Stresam",
        administration: "Oral",
        halfLife: "6-8 hours",
        uses: "Etifoxine is used for the treatment of anxiety disorders with somatic symptoms.",
        dosage: "50 mg three times daily. Maximum daily dose: 150 mg. Treatment duration typically 2-12 weeks.",
        sideEffects: [
            "Mild drowsiness",
            "Gastrointestinal discomfort",
            "Skin reactions",
            "Headache",
            "Dizziness"
        ],
        interactions: [
            { drug: "Alcohol", level: "medium", description: "Enhanced sedative effects" },
            { drug: "CNS depressants", level: "medium", description: "Additive sedation" },
            { drug: "Hepatotoxic drugs", level: "medium", description: "Increased liver toxicity risk" }
        ],
        safety: "Not available in all countries. Lower risk of dependence compared to benzodiazepines. Monitor liver function during treatment."
    },

    "Bromazepam": {
        class: "Benzodiazepine",
        brandNames: "Lexotan, Lexomil",
        administration: "Oral",
        halfLife: "12-20 hours",
        uses: "Bromazepam is used for short-term management of severe anxiety and panic attacks.",
        dosage: "1.5-6 mg 2-3 times daily. Maximum daily dose: 18 mg. Start with lowest effective dose.",
        sideEffects: [
            "Drowsiness",
            "Sedation",
            "Memory impairment",
            "Muscle weakness",
            "Confusion",
            "Depression"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Antidepressants", level: "medium", description: "Increased sedation" },
            { drug: "Antipsychotics", level: "medium", description: "Enhanced CNS effects" }
        ],
        safety: "High potential for dependence. Withdrawal symptoms can be severe. Not recommended for long-term use."
    },

    "Midazolam": {
        class: "Benzodiazepine",
        brandNames: "Versed",
        administration: "IV, IM, Oral, Intranasal",
        halfLife: "1.5-2.5 hours",
        uses: "Midazolam is used for procedural sedation, pre-anesthetic medication, and status epilepticus.",
        dosage: "For procedural sedation: 0.5-2 mg IV. Pre-op: 2-5 mg IM. Maximum single dose: 10 mg.",
        sideEffects: [
            "Respiratory depression",
            "Hypotension",
            "Hiccups",
            "Nausea",
            "Headache",
            "Oversedation"
        ],
        interactions: [
            { drug: "Opioids", level: "high", description: "Severe respiratory depression" },
            { drug: "Protease inhibitors", level: "high", description: "Dramatically increased midazolam levels" },
            { drug: "Erythromycin", level: "high", description: "Increased sedation and respiratory depression" },
            { drug: "Alcohol", level: "high", description: "Life-threatening respiratory depression" }
        ],
        safety: "Only for use in monitored settings. High risk of respiratory depression. Contraindicated in acute narrow-angle glaucoma."
    },

    "Nitrazepam": {
        class: "Benzodiazepine",
        brandNames: "Mogadon",
        administration: "Oral",
        halfLife: "16-48 hours",
        uses: "Nitrazepam is used primarily for short-term treatment of severe insomnia and sometimes for anxiety.",
        dosage: "5-10 mg at bedtime. Maximum daily dose: 10 mg. Elderly: 2.5-5 mg at bedtime.",
        sideEffects: [
            "Morning drowsiness",
            "Dizziness",
            "Confusion",
            "Memory impairment",
            "Headache",
            "Gastrointestinal upset"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Other CNS depressants", level: "high", description: "Additive sedation" },
            { drug: "Disulfiram", level: "medium", description: "Increased nitrazepam effects" }
        ],
        safety: "High risk of dependence and tolerance. Withdrawal insomnia may occur. Not recommended for long-term use."
    },

    "Temazepam": {
        class: "Benzodiazepine",
        brandNames: "Restoril",
        administration: "Oral",
        halfLife: "8-20 hours",
        uses: "Temazepam is used for short-term treatment of insomnia and sometimes for anxiety-related sleep disturbances.",
        dosage: "7.5-30 mg at bedtime. Maximum daily dose: 30 mg. Start with lowest effective dose.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Lethargy",
            "Headache",
            "Nausea",
            "Dry mouth"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Antidepressants", level: "medium", description: "Increased sedation" },
            { drug: "Antipsychotics", level: "medium", description: "Enhanced CNS effects" }
        ],
        safety: "Schedule IV controlled substance. Risk of dependence and withdrawal. Avoid alcohol during treatment."
    },

    "Lofepramine": {
        class: "Tricyclic antidepressant",
        brandNames: "Lomont, Gamanil",
        administration: "Oral",
        halfLife: "1.5-6 hours",
        uses: "Lofepramine is used for the treatment of depression and sometimes for anxiety associated with depression.",
        dosage: "70-210 mg daily in divided doses. Maximum daily dose: 210 mg. Start with 70 mg twice daily.",
        sideEffects: [
            "Dry mouth",
            "Constipation",
            "Blurred vision",
            "Drowsiness",
            "Dizziness",
            "Weight gain"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Hypertensive crisis" },
            { drug: "Sympathomimetics", level: "high", description: "Hypertension and arrhythmias" },
            { drug: "Anticholinergics", level: "medium", description: "Enhanced side effects" },
            { drug: "Alcohol", level: "medium", description: "Increased sedation" }
        ],
        safety: "May take 2-4 weeks for full antidepressant effect. Risk of suicidal thoughts initially. Monitor for cardiac effects."
    },

    "Meprobamate": {
        class: "Carbamate",
        brandNames: "Miltown, Equanil",
        administration: "Oral",
        halfLife: "6-17 hours",
        uses: "Meprobamate is used for short-term management of anxiety disorders.",
        dosage: "400 mg 3-4 times daily. Maximum daily dose: 2400 mg. Not recommended for long-term use.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Headache",
            "Nausea",
            "Rash",
            "Blood dyscrasias"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Other CNS depressants", level: "high", description: "Additive effects" },
            { drug: "Oral anticoagulants", level: "medium", description: "Altered anticoagulant effect" }
        ],
        safety: "High potential for abuse and dependence. Withdrawal can be severe. Rare but serious blood dyscrasias possible."
    },

    "Clorazepate": {
        class: "Benzodiazepine",
        brandNames: "Tranxene",
        administration: "Oral",
        halfLife: "30-100 hours",
        uses: "Clorazepate is used for anxiety disorders, alcohol withdrawal, and partial seizures.",
        dosage: "For anxiety: 15-60 mg daily in divided doses. Maximum daily dose: 90 mg. Start with 7.5 mg 2-3 times daily.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Blurred vision",
            "Headache",
            "Gastrointestinal upset",
            "Memory problems"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Cimetidine", level: "medium", description: "Increased clorazepate levels" },
            { drug: "Oral contraceptives", level: "medium", description: "Increased benzodiazepine effects" }
        ],
        safety: "Long half-life may cause accumulation. Risk of dependence. Withdrawal symptoms may be delayed due to long half-life."
    },

    "Phenibut": {
        class: "GABA analogue",
        brandNames: "Noofen, Fenibut",
        administration: "Oral",
        halfLife: "5-6 hours",
        uses: "Phenibut is used for anxiety, insomnia, and sometimes for post-traumatic stress disorder.",
        dosage: "250-500 mg 3 times daily. Maximum daily dose: 2500 mg. Not for long-term use.",
        sideEffects: [
            "Drowsiness",
            "Nausea",
            "Headache",
            "Dizziness",
            "Hangover effect",
            "Tolerance"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Benzodiazepines", level: "high", description: "Enhanced sedation" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Other CNS depressants", level: "high", description: "Additive effects" }
        ],
        safety: "High risk of dependence and severe withdrawal. Not FDA-approved in the US. Use with extreme caution."
    },

    "Flurazepam": {
        class: "Benzodiazepine",
        brandNames: "Dalmane",
        administration: "Oral",
        halfLife: "40-250 hours",
        uses: "Flurazepam is used for the treatment of insomnia characterized by difficulty falling asleep or staying asleep.",
        dosage: "15-30 mg at bedtime. Maximum daily dose: 30 mg. Elderly: 15 mg at bedtime.",
        sideEffects: [
            "Morning drowsiness",
            "Dizziness",
            "Staggering",
            "Headache",
            "Heartburn",
            "Dry mouth"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Respiratory depression" },
            { drug: "Cimetidine", level: "medium", description: "Increased flurazepam levels" },
            { drug: "Disulfiram", level: "medium", description: "Enhanced sedative effects" }
        ],
        safety: "Very long half-life - not recommended for elderly patients. High risk of accumulation. Severe withdrawal possible."
    },
    "Risperidone": {
        class: "Atypical Antipsychotic",
        brandNames: "Risperdal, Risperdal Consta",
        administration: "Oral, Injectable",
        halfLife: "20 hours",
        uses: "Risperidone is used to treat schizophrenia, bipolar disorder, and irritability associated with autistic disorder.",
        dosage: "For schizophrenia: Start 1-2 mg twice daily, increase to 4-8 mg/day. For bipolar: 2-3 mg once daily. Maximum 16 mg/day.",
        sideEffects: [
            "Drowsiness or sedation",
            "Dizziness",
            "Weight gain",
            "Increased prolactin levels",
            "Extrapyramidal symptoms",
            "Headache",
            "Anxiety"
        ],
        interactions: [
            { drug: "Carbamazepine", level: "high", description: "Decreases risperidone levels" },
            { drug: "Fluoxetine", level: "medium", description: "Increases risperidone levels" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Antihypertensives", level: "medium", description: "May increase hypotensive effects" }
        ],
        safety: "May increase mortality in elderly patients with dementia-related psychosis. Monitor for neuroleptic malignant syndrome and tardive dyskinesia."
    },

    "Olanzapine": {
        class: "Atypical Antipsychotic",
        brandNames: "Zyprexa, Zyprexa Zydis",
        administration: "Oral, Injectable",
        halfLife: "21-54 hours",
        uses: "Olanzapine is used to treat schizophrenia, bipolar disorder, and as an adjunct in treatment-resistant depression.",
        dosage: "For schizophrenia: Start 5-10 mg once daily, range 10-20 mg/day. For bipolar: 5-20 mg/day. Maximum 20 mg/day.",
        sideEffects: [
            "Weight gain",
            "Drowsiness",
            "Dry mouth",
            "Increased appetite",
            "Dizziness",
            "Constipation",
            "Elevated blood sugar"
        ],
        interactions: [
            { drug: "Carbamazepine", level: "high", description: "Decreases olanzapine levels" },
            { drug: "Fluvoxamine", level: "medium", description: "Increases olanzapine levels" },
            { drug: "Benzodiazepines", level: "high", description: "Increased risk of sedation and respiratory depression" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" }
        ],
        safety: "Increased risk of hyperglycemia and diabetes. Monitor weight, blood glucose, and lipid profile regularly. Not for dementia-related psychosis."
    },

    "Quetiapine": {
        class: "Atypical Antipsychotic",
        brandNames: "Seroquel, Seroquel XR",
        administration: "Oral",
        halfLife: "6 hours",
        uses: "Quetiapine is used to treat schizophrenia, bipolar disorder, and as adjunct treatment for major depressive disorder.",
        dosage: "For schizophrenia: Start 25 mg twice daily, increase to 300-800 mg/day. For bipolar: 400-800 mg/day. For depression: 150-300 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Dizziness",
            "Constipation",
            "Weight gain",
            "Increased heart rate",
            "Cataracts (long-term use)"
        ],
        interactions: [
            { drug: "CYP3A4 inhibitors", level: "high", description: "Increase quetiapine levels" },
            { drug: "CYP3A4 inducers", level: "high", description: "Decrease quetiapine levels" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" }
        ],
        safety: "Monitor for cataracts with long-term use. May cause orthostatic hypotension. Risk of hyperglycemia and dyslipidemia."
    },

    "Aripiprazole": {
        class: "Atypical Antipsychotic",
        brandNames: "Abilify, Abilify Maintena",
        administration: "Oral, Injectable",
        halfLife: "75 hours",
        uses: "Aripiprazole is used to treat schizophrenia, bipolar disorder, major depressive disorder, and irritability associated with autism.",
        dosage: "For schizophrenia: Start 10-15 mg once daily, range 10-30 mg/day. For bipolar: 15-30 mg/day. Maximum 30 mg/day.",
        sideEffects: [
            "Headache",
            "Anxiety",
            "Insomnia",
            "Nausea",
            "Vomiting",
            "Constipation",
            "Dizziness",
            "Akathisia"
        ],
        interactions: [
            { drug: "CYP3A4 inhibitors", level: "medium", description: "Increase aripiprazole levels" },
            { drug: "CYP2D6 inhibitors", level: "medium", description: "Increase aripiprazole levels" },
            { drug: "Carbamazepine", level: "high", description: "Decreases aripiprazole levels" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" }
        ],
        safety: "May increase suicidal thoughts in children and young adults. Monitor for neuroleptic malignant syndrome and tardive dyskinesia."
    },

    "Ziprasidone": {
        class: "Atypical Antipsychotic",
        brandNames: "Geodon",
        administration: "Oral, Injectable",
        halfLife: "7 hours",
        uses: "Ziprasidone is used to treat schizophrenia and acute manic or mixed episodes associated with bipolar disorder.",
        dosage: "For schizophrenia: Start 20 mg twice daily with food, range 40-160 mg/day. For bipolar: 40-80 mg twice daily. Maximum 160 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Nausea",
            "Constipation",
            "Akathisia",
            "Respiratory tract infection",
            "ECG changes (QT prolongation)"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of cardiac arrhythmias" },
            { drug: "Carbamazepine", level: "high", description: "Decreases ziprasidone levels" },
            { drug: "Ketoconazole", level: "medium", description: "Increases ziprasidone levels" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" }
        ],
        safety: "Contraindicated in patients with known QT prolongation. Monitor ECG in patients with cardiac risk factors. Take with food for optimal absorption."
    },

    "Clozapine": {
        class: "Atypical Antipsychotic",
        brandNames: "Clozaril, Versacloz, Fazaclo",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Clozapine is used for treatment-resistant schizophrenia and to reduce suicidal behavior in schizophrenia or schizoaffective disorder.",
        dosage: "Start 12.5 mg once or twice daily, increase gradually to 300-900 mg/day. Must follow REMS program requirements.",
        sideEffects: [
            "Sedation",
            "Drooling",
            "Dizziness",
            "Constipation",
            "Tachycardia",
            "Weight gain",
            "Agranulocytosis (risk requires monitoring)"
        ],
        interactions: [
            { drug: "Bone marrow suppressants", level: "high", description: "Increased risk of agranulocytosis" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Fluvoxamine", level: "high", description: "Significantly increases clozapine levels" },
            { drug: "Carbamazepine", level: "high", description: "Decreases clozapine levels and increases agranulocytosis risk" }
        ],
        safety: "REMS program required due to risk of agranulocytosis. Weekly blood monitoring for first 6 months, then biweekly. Monitor for myocarditis and seizures."
    },

    "Haloperidol": {
        class: "Typical Antipsychotic",
        brandNames: "Haldol, Haloperidol Decanoate",
        administration: "Oral, Injectable",
        halfLife: "12-36 hours",
        uses: "Haloperidol is used to treat psychotic disorders, Tourette's syndrome, and severe behavioral problems in children.",
        dosage: "For psychosis: 0.5-5 mg 2-3 times daily, range 1-100 mg/day. For agitation: 2-5 mg IM every 4-8 hours.",
        sideEffects: [
            "Extrapyramidal symptoms",
            "Akathisia",
            "Dystonia",
            "Sedation",
            "Dry mouth",
            "Constipation",
            "QT prolongation",
            "Tardive dyskinesia"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of cardiac arrhythmias" },
            { drug: "Carbamazepine", level: "medium", description: "Decreases haloperidol levels" },
            { drug: "Fluoxetine", level: "medium", description: "Increases haloperidol levels" },
            { drug: "Lithium", level: "medium", description: "Increased risk of neurotoxicity" }
        ],
        safety: "High risk of extrapyramidal symptoms and tardive dyskinesia. Monitor ECG for QT prolongation. Use lowest effective dose for shortest duration."
    },

    "Fluphenazine": {
        class: "Typical Antipsychotic",
        brandNames: "Prolixin, Permitil",
        administration: "Oral, Injectable",
        halfLife: "15 hours",
        uses: "Fluphenazine is used to treat psychotic disorders such as schizophrenia.",
        dosage: "Oral: Start 2.5-10 mg/day in divided doses, maintenance 1-5 mg/day. IM: 12.5-25 mg every 1-4 weeks.",
        sideEffects: [
            "Extrapyramidal symptoms",
            "Akathisia",
            "Dystonia",
            "Sedation",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Tardive dyskinesia"
        ],
        interactions: [
            { drug: "Anticholinergic drugs", level: "medium", description: "May reduce antipsychotic efficacy" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Lithium", level: "medium", description: "Increased risk of neurotoxicity" },
            { drug: "Propranolol", level: "medium", description: "Increases fluphenazine levels" }
        ],
        safety: "High risk of extrapyramidal symptoms. Monitor for neuroleptic malignant syndrome. Use caution in elderly patients with dementia."
    },

    "Chlorpromazine": {
        class: "Typical Antipsychotic",
        brandNames: "Thorazine, Largactil",
        administration: "Oral, Injectable, Rectal",
        halfLife: "30 hours",
        uses: "Chlorpromazine is used to treat psychotic disorders, nausea and vomiting, preoperative anxiety, and intractable hiccups.",
        dosage: "For psychosis: 10-25 mg 2-4 times daily, range 30-800 mg/day. For nausea: 10-25 mg every 4-6 hours.",
        sideEffects: [
            "Sedation",
            "Orthostatic hypotension",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Photosensitivity",
            "Extrapyramidal symptoms",
            "Jaundice"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Anticholinergic drugs", level: "medium", description: "Increased anticholinergic effects" },
            { drug: "Epinephrine", level: "high", description: "Paradoxical hypotension" },
            { drug: "Propranolol", level: "medium", description: "Increased levels of both drugs" }
        ],
        safety: "May cause pigmentary retinopathy with long-term high doses. Risk of agranulocytosis. Avoid sun exposure due to photosensitivity."
    },

    "Paliperidone": {
        class: "Atypical Antipsychotic",
        brandNames: "Invega, Invega Sustenna, Invega Trinza",
        administration: "Oral, Injectable",
        halfLife: "23 hours",
        uses: "Paliperidone is used to treat schizophrenia and schizoaffective disorder.",
        dosage: "Oral: Start 6 mg once daily, range 3-12 mg/day. Injectable: 39-234 mg monthly based on formulation.",
        sideEffects: [
            "Headache",
            "Drowsiness",
            "Dizziness",
            "Akathisia",
            "Weight gain",
            "Increased prolactin",
            "Tachycardia",
            "Extrapyramidal symptoms"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of cardiac arrhythmias" },
            { drug: "Carbamazepine", level: "high", description: "Decreases paliperidone levels" },
            { drug: "Paroxetine", level: "medium", description: "Increases paliperidone levels" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" }
        ],
        safety: "May increase mortality in elderly patients with dementia-related psychosis. Monitor for QT prolongation and metabolic changes."
    },

    "Lurasidone": {
        class: "Atypical Antipsychotic",
        brandNames: "Latuda",
        administration: "Oral",
        halfLife: "18 hours",
        uses: "Lurasidone is used to treat schizophrenia and depressive episodes associated with bipolar disorder.",
        dosage: "For schizophrenia: Start 40 mg once daily, range 40-160 mg/day. For bipolar depression: 20-120 mg/day. Take with food.",
        sideEffects: [
            "Drowsiness",
            "Akathisia",
            "Nausea",
            "Parkinsonism",
            "Anxiety",
            "Restlessness",
            "Increased prolactin"
        ],
        interactions: [
            {drug: "Strong CYP3A4 inhibitors", level: "high", description: "Significantly increase lurasidone levels" },
            { drug: "Strong CYP3A4 inducers", level: "high", description: "Significantly decrease lurasidone levels" },
            { drug: "QT-prolonging drugs", level: "medium", description: "Increased risk of cardiac arrhythmias" }
        ],
        safety: "Must be taken with food (at least 350 calories) for adequate absorption. Monitor for metabolic changes and extrapyramidal symptoms."
    },

    "Cariprazine": {
        class: "Atypical Antipsychotic",
        brandNames: "Vraylar",
        administration: "Oral",
        halfLife: "2-5 days",
        uses: "Cariprazine is used to treat schizophrenia, manic or mixed episodes associated with bipolar disorder, and depressive episodes associated with bipolar disorder.",
        dosage: "Start 1.5 mg once daily, range 1.5-6 mg/day for schizophrenia, 3-6 mg/day for bipolar mania.",
        sideEffects: [
            "Akathisia",
            "Extrapyramidal symptoms",
            "Indigestion",
            "Nausea",
            "Constipation",
            "Vomiting",
            "Drowsiness",
            "Restlessness"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increase cariprazine levels" },
            { drug: "CNS depressants", level: "medium", description: "Enhanced sedative effects" },
            { drug: "Antihypertensives", level: "medium", description: "May enhance hypotensive effects" }
        ],
        safety: "Long half-life requires several weeks to reach steady state. Monitor for akathisia and extrapyramidal symptoms, which are common."
    },

    "Thioridazine": {
        class: "Typical Antipsychotic",
        brandNames: "Mellaril",
        administration: "Oral",
        halfLife: "24 hours",
        uses: "Thioridazine is used for schizophrenia in patients who have not responded to other antipsychotics.",
        dosage: "Start 50-100 mg three times daily, range 200-800 mg/day. Maximum 800 mg/day.",
        sideEffects: [
            "QT prolongation",
            "Sedation",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Retinal pigmentation",
            "Orthostatic hypotension",
            "Priapism"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Contraindicated due to high arrhythmia risk" },
            { drug: "CYP2D6 inhibitors", level: "high", description: "Increase thioridazine levels" },
            { drug: "Fluoxetine", level: "high", description: "Contraindicated combination" },
            { drug: "Paroxetine", level: "high", description: "Contraindicated combination" }
        ],
        safety: "Black box warning for QT prolongation and sudden death. Requires baseline ECG and regular monitoring. Contraindicated with many medications."
    },

    "Perphenazine": {
        class: "Typical Antipsychotic",
        brandNames: "Trilafon",
        administration: "Oral, Injectable",
        halfLife: "9-12 hours",
        uses: "Perphenazine is used to treat schizophrenia and severe nausea and vomiting.",
        dosage: "For psychosis: 4-16 mg 2-4 times daily, range 8-64 mg/day. For nausea: 8-16 mg daily in divided doses.",
        sideEffects: [
            "Extrapyramidal symptoms",
            "Akathisia",
            "Drowsiness",
            "Dizziness",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Tardive dyskinesia"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Anticholinergic drugs", level: "medium", description: "May reduce antipsychotic efficacy" },
            { drug: "Lithium", level: "medium", description: "Increased risk of neurotoxicity" },
            { drug: "Propranolol", level: "medium", description: "Increases perphenazine levels" }
        ],
        safety: "High risk of extrapyramidal symptoms. Monitor for neuroleptic malignant syndrome and tardive dyskinesia. Use lowest effective dose."
    },

    "Amisulpride": {
        class: "Atypical Antipsychotic",
        brandNames: "Solian, Barhemsys",
        administration: "Oral, Injectable",
        halfLife: "12 hours",
        uses: "Amisulpride is used to treat schizophrenia and prevention of postoperative nausea and vomiting.",
        dosage: "For positive symptoms: 400-800 mg/day. For negative symptoms: 50-300 mg/day. Maximum 1200 mg/day.",
        sideEffects: [
            "Increased prolactin",
            "Insomnia",
            "Anxiety",
            "Agitation",
            "Extrapyramidal symptoms",
            "Weight gain",
            "QT prolongation"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of cardiac arrhythmias" },
            { drug: "Levodopa", level: "medium", description: "Antagonizes effects" },
            { drug: "Alcohol", level: "medium", description: "Enhanced sedative effects" }
        ],
        safety: "Significantly increases prolactin levels. Monitor ECG for QT prolongation. Use caution in patients with renal impairment."
    },
    "Zolpidem": {
        class: "Non-benzodiazepine Hypnotic",
        brandNames: "Ambien, Edluar, Intermezzo",
        administration: "Oral",
        halfLife: "2-3 hours",
        uses: "Zolpidem is used for the short-term treatment of insomnia to help with falling asleep.",
        dosage: "Adults: 5-10 mg immediately before bedtime. Maximum dose: 10 mg. Lower doses recommended for elderly or hepatic impairment.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Diarrhea",
            "Daytime drowsiness",
            "Headache",
            "Nausea"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression and impairment" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Rifampin", level: "medium", description: "May decrease zolpidem effectiveness" },
            { drug: "Ketoconazole", level: "medium", description: "May increase zolpidem levels" }
        ],
        safety: "May cause complex sleep behaviors including sleep-walking, sleep-driving, and other activities without full awareness. Do not take unless you can get a full night's sleep (7-8 hours)."
    },
    "Zaleplon": {
        class: "Non-benzodiazepine Hypnotic",
        brandNames: "Sonata",
        administration: "Oral",
        halfLife: "1 hour",
        uses: "Zaleplon is used for the short-term treatment of insomnia, particularly for difficulty falling asleep.",
        dosage: "Adults: 5-20 mg at bedtime. Maximum dose: 20 mg. Lower doses recommended for elderly or hepatic impairment.",
        sideEffects: [
            "Dizziness",
            "Lightheadedness",
            "Coordination problems",
            "Memory problems",
            "Headache",
            "Nausea"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Cimetidine", level: "medium", description: "May increase zaleplon levels" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Enzyme inducers", level: "medium", description: "May decrease effectiveness" }
        ],
        safety: "Take only when you have time for a full night's sleep. May cause memory problems and sleep-related behaviors. Do not take with alcohol."
    },
    "Eszopiclone": {
        class: "Non-benzodiazepine Hypnotic",
        brandNames: "Lunesta",
        administration: "Oral",
        halfLife: "6 hours",
        uses: "Eszopiclone is used for the treatment of insomnia to help with falling asleep and staying asleep.",
        dosage: "Adults: 1-3 mg immediately before bedtime. Starting dose: 1 mg. Maximum dose: 3 mg.",
        sideEffects: [
            "Unpleasant taste in mouth",
            "Headache",
            "Drowsiness",
            "Dizziness",
            "Dry mouth",
            "Nausea"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Olanzapine", level: "medium", description: "Increased drowsiness" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Strong CYP3A4 inhibitors", level: "medium", description: "May increase eszopiclone levels" }
        ],
        safety: "May cause sleep-related behaviors and next-day impairment. Do not take unless you can get a full night's sleep. May cause dependence with long-term use."
    },
    "Ramelteon": {
        class: "Melatonin Receptor Agonist",
        brandNames: "Rozerem",
        administration: "Oral",
        halfLife: "1-2.6 hours",
        uses: "Ramelteon is used for the treatment of insomnia characterized by difficulty with sleep onset.",
        dosage: "Adults: 8 mg taken within 30 minutes of going to bed. Do not take with or immediately after a high-fat meal.",
        sideEffects: [
            "Dizziness",
            "Fatigue",
            "Nausea",
            "Worsening insomnia",
            "Headache",
            "Somnolence"
        ],
        interactions: [
            { drug: "Fluvoxamine", level: "high", description: "Significantly increases ramelteon levels" },
            { drug: "Alcohol", level: "medium", description: "May enhance CNS effects" },
            { drug: "Strong CYP1A2 inhibitors", level: "high", description: "Increased ramelteon exposure" },
            { drug: "Rifampin", level: "medium", description: "Decreases ramelteon effectiveness" }
        ],
        safety: "Not a controlled substance. Does not cause dependence or withdrawal symptoms. Should not be used in patients with severe hepatic impairment."
    },
    "Melatonin": {
        class: "Hormone Supplement",
        brandNames: "Various OTC brands",
        administration: "Oral",
        halfLife: "30-50 minutes",
        uses: "Melatonin is used to treat insomnia, jet lag, and sleep-wake cycle disturbances. Also used for circadian rhythm disorders.",
        dosage: "For insomnia: 1-5 mg 30-60 minutes before bedtime. For jet lag: 0.5-5 mg at destination bedtime.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Nausea",
            "Drowsiness",
            "Vivid dreams",
            "Daytime sleepiness"
        ],
        interactions: [
            { drug: "Blood pressure medications", level: "medium", description: "May affect blood pressure control" },
            { drug: "Diabetes medications", level: "medium", description: "May affect blood sugar levels" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "CNS depressants", level: "medium", description: "May enhance sedative effects" }
        ],
        safety: "Generally considered safe for short-term use. Long-term effects unknown. May affect hormonal development in children. Consult healthcare provider before use in pregnancy."
    },
    "Doxepin (low-dose)": {
        class: "Tricyclic Antidepressant",
        brandNames: "Silenor",
        administration: "Oral",
        halfLife: "15 hours",
        uses: "Low-dose doxepin is used for the treatment of insomnia characterized by difficulties with sleep maintenance.",
        dosage: "Adults: 3-6 mg once daily within 30 minutes of bedtime. Do not take within 3 hours of a meal.",
        sideEffects: [
            "Sedation",
            "Headache",
            "Nausea",
            "Upper respiratory infection",
            "Drowsiness",
            "Dry mouth"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Cimetidine", level: "medium", description: "May increase doxepin levels" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" }
        ],
        safety: "Contraindicated in patients with untreated narrow-angle glaucoma or severe urinary retention. May cause next-day impairment. Not recommended in patients with severe sleep apnea."
    },
    "Temazepam": {
        class: "Benzodiazepine",
        brandNames: "Restoril",
        administration: "Oral",
        halfLife: "8-20 hours",
        uses: "Temazepam is used for the short-term treatment of insomnia to help with falling asleep and staying asleep.",
        dosage: "Adults: 7.5-30 mg at bedtime. Starting dose: 7.5-15 mg. Maximum dose: 30 mg.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Lethargy",
            "Headache",
            "Fatigue",
            "Nervousness"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Severe CNS depression" },
            { drug: "Opioids", level: "high", description: "Profound sedation and respiratory depression" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Oral contraceptives", level: "medium", description: "May increase temazepam levels" }
        ],
        safety: "Risk of dependence and withdrawal symptoms. Not recommended for long-term use. May cause rebound insomnia. Avoid abrupt discontinuation after prolonged use."
    },
    "Trazodone": {
        class: "Serotonin Antagonist and Reuptake Inhibitor (SARI)",
        brandNames: "Desyrel, Oleptro",
        administration: "Oral",
        halfLife: "5-9 hours",
        uses: "Trazodone is used for the treatment of depression and off-label for insomnia, particularly for sleep maintenance.",
        dosage: "For insomnia: 25-100 mg at bedtime. For depression: 150-400 mg daily in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Dry mouth",
            "Blurred vision",
            "Headache",
            "Nausea"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "Other serotonergic drugs", level: "high", description: "Increased serotonin effects" },
            { drug: "CNS depressants", level: "medium", description: "Enhanced sedative effects" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" }
        ],
        safety: "Risk of priapism (prolonged, painful erection). May cause orthostatic hypotension. Monitor for serotonin syndrome when used with other serotonergic agents."
    },
    "Suvorexant": {
        class: "Orexin Receptor Antagonist",
        brandNames: "Belsomra",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Suvorexant is used for the treatment of insomnia characterized by difficulties with sleep onset and/or sleep maintenance.",
        dosage: "Adults: 10-20 mg once nightly within 30 minutes of bedtime. Maximum dose: 20 mg.",
        sideEffects: [
            "Somnolence",
            "Headache",
            "Dizziness",
            "Abnormal dreams",
            "Dry mouth",
            "Next-day drowsiness"
        ],
        interactions: [
            { drug: "Strong CYP3A inhibitors", level: "high", description: "Increased suvorexant exposure" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Strong CYP3A inducers", level: "medium", description: "Decreased suvorexant effectiveness" }
        ],
        safety: "May cause sleep paralysis, hypnagogic/hypnopompic hallucinations, and cataplexy-like symptoms. Risk of next-day impairment. Not recommended with severe hepatic impairment."
    },
    "Diphenhydramine": {
        class: "First-generation Antihistamine",
        brandNames: "Benadryl, Sominex, Nytol",
        administration: "Oral",
        halfLife: "2-8 hours",
        uses: "Diphenhydramine is used for the relief of allergy symptoms and as a sleep aid for occasional sleeplessness.",
        dosage: "For insomnia: 25-50 mg 30 minutes before bedtime. Maximum dose: 50 mg. Not recommended for long-term use.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Dizziness",
            "Urinary retention",
            "Blurred vision",
            "Constipation"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "high", description: "Enhanced anticholinergic effects" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Anticholinergic drugs", level: "medium", description: "Increased anticholinergic side effects" }
        ],
        safety: "Not recommended for long-term use due to tolerance development. May cause paradoxical excitation in children and elderly. Use with caution in patients with glaucoma, urinary retention, or asthma."
    },
    "Hydroxyzine": {
        class: "First-generation Antihistamine",
        brandNames: "Vistaril, Atarax",
        administration: "Oral",
        halfLife: "20-25 hours",
        uses: "Hydroxyzine is used for anxiety, tension, pruritus, and as a sedative for preoperative and preprocedural sedation.",
        dosage: "For sedation: 50-100 mg at bedtime. For anxiety: 50-100 mg 4 times daily. Maximum daily dose: 400 mg.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Headache",
            "Dizziness",
            "Blurred vision",
            "Constipation"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Enzyme inhibitors", level: "medium", description: "May increase hydroxyzine levels" },
            { drug: "Anticholinergic drugs", level: "medium", description: "Enhanced anticholinergic effects" }
        ],
        safety: "May impair mental and physical abilities. Not recommended during early pregnancy. Use with caution in elderly patients due to increased sensitivity to anticholinergic effects."
    },
    "Albuterol": {
        class: "Short-Acting Beta Agonist (SABA)",
        brandNames: "ProAir, Ventolin, Proventil",
        administration: "Inhalation, Oral, Nebulization",
        halfLife: "3-6 hours",
        uses: "Albuterol is used to treat or prevent bronchospasm in people with reversible obstructive airway disease. It is also used to prevent exercise-induced bronchospasm.",
        dosage: "For bronchospasm: 1-2 inhalations every 4-6 hours as needed. Maximum 8 inhalations per day. For prevention of exercise-induced bronchospasm: 2 inhalations 15-30 minutes before exercise.",
        sideEffects: [
            "Nervousness or shakiness",
            "Headache",
            "Throat irritation",
            "Rapid heart rate",
            "Muscle cramps",
            "Cough"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May block bronchodilating effect" },
            { drug: "Diuretics", level: "medium", description: "May increase risk of hypokalemia" },
            { drug: "Digoxin", level: "medium", description: "May decrease digoxin levels" },
            { drug: "MAO inhibitors", level: "high", description: "May increase cardiovascular effects" }
        ],
        safety: "Overuse may lead to paradoxical bronchospasm. Use with caution in patients with cardiovascular disorders, diabetes, or hyperthyroidism. Not for primary treatment of status asthmaticus."
    },

    "Salbutamol": {
        class: "Short-Acting Beta Agonist (SABA)",
        brandNames: "Ventolin, Airomir, Asmasal",
        administration: "Inhalation, Oral, Nebulization",
        halfLife: "4-6 hours",
        uses: "Salbutamol is used for relief of bronchospasm in conditions such as asthma and chronic obstructive pulmonary disease (COPD).",
        dosage: "Adults: 100-200 mcg (1-2 puffs) as needed up to 4 times daily. Children: 100 mcg as needed up to 4 times daily.",
        sideEffects: [
            "Fine tremor of hands",
            "Headache",
            "Tachycardia",
            "Muscle cramps",
            "Hypokalemia",
            "Nervousness"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "Antagonistic effect - avoid concurrent use" },
            { drug: "Diuretics", level: "medium", description: "Enhanced hypokalemic effect" },
            { drug: "Digoxin", level: "medium", description: "Risk of hypokalemia may increase digoxin toxicity" }
        ],
        safety: "Paradoxical bronchospasm may occur. Use with caution in patients with cardiovascular disease, diabetes, or hyperthyroidism. Do not exceed recommended dosage."
    },

    "Levalbuterol": {
        class: "Short-Acting Beta Agonist (SABA)",
        brandNames: "Xopenex",
        administration: "Inhalation, Nebulization",
        halfLife: "3-4 hours",
        uses: "Levalbuterol is used for the treatment or prevention of bronchospasm in adults and children with reversible obstructive airway disease.",
        dosage: "Nebulization: 0.63 mg three times daily, every 6-8 hours. Maximum 1.25 mg three times daily. Inhalation: 1-2 inhalations every 4-6 hours.",
        sideEffects: [
            "Nervousness",
            "Tremor",
            "Headache",
            "Tachycardia",
            "Dizziness",
            "Pharyngitis"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "Mutual antagonism - avoid concurrent use" },
            { drug: "Diuretics", level: "medium", description: "May worsen hypokalemia" },
            { drug: "Digoxin", level: "medium", description: "May decrease serum digoxin levels" }
        ],
        safety: "Contains the (R)-isomer of albuterol. May cause paradoxical bronchospasm. Use with caution in patients with cardiovascular disorders."
    },

    "Formoterol": {
        class: "Long-Acting Beta Agonist (LABA)",
        brandNames: "Foradil, Oxeze, Perforomist",
        administration: "Inhalation",
        halfLife: "10 hours",
        uses: "Formoterol is used for long-term maintenance treatment of asthma and prevention of bronchospasm in patients with reversible obstructive airways disease. Also used for COPD maintenance.",
        dosage: "Asthma: 12 mcg every 12 hours. COPD: 12 mcg every 12 hours. Maximum 24 mcg twice daily. Should be used with an inhaled corticosteroid.",
        sideEffects: [
            "Tremor",
            "Palpitations",
            "Headache",
            "Muscle cramps",
            "Tachycardia",
            "Cough"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May block bronchodilating effect" },
            { drug: "Diuretics", level: "medium", description: "May increase risk of hypokalemia" },
            { drug: "MAO inhibitors", level: "high", description: "May potentiate cardiovascular effects" },
            { drug: "Tricyclic antidepressants", level: "medium", description: "May potentiate cardiovascular effects" }
        ],
        safety: "Not for relief of acute bronchospasm. Increased risk of asthma-related death. Must be used with an inhaled corticosteroid for asthma treatment. Do not use as monotherapy."
    },

    "Salmeterol": {
        class: "Long-Acting Beta Agonist (LABA)",
        brandNames: "Serevent",
        administration: "Inhalation",
        halfLife: "5.5 hours",
        uses: "Salmeterol is used for long-term maintenance treatment of asthma and prevention of bronchospasm. Also used for prevention of exercise-induced bronchospasm and maintenance treatment of COPD.",
        dosage: "Asthma/COPD: 1 inhalation (50 mcg) twice daily, approximately 12 hours apart. Exercise-induced bronchospasm: 1 inhalation at least 30 minutes before exercise.",
        sideEffects: [
            "Upper respiratory infection",
            "Headache",
            "Throat irritation",
            "Tremor",
            "Palpitations",
            "Cough"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "Mutual antagonism - avoid concurrent use" },
            { drug: "Diuretics", level: "medium", description: "May enhance hypokalemic effect" },
            { drug: "MAO inhibitors", level: "high", description: "May increase cardiovascular effects" }
        ],
        safety: "Black box warning: Increased risk of asthma-related death. Not for acute bronchospasm. Must be used with inhaled corticosteroids for asthma. Do not exceed recommended dosage."
    },

    "Budesonide": {
        class: "Inhaled Corticosteroid",
        brandNames: "Pulmicort, Rhinocort, Entocort",
        administration: "Inhalation, Nasal, Oral",
        halfLife: "2-3 hours",
        uses: "Budesonide is used for maintenance treatment of asthma as prophylactic therapy. Also used for allergic rhinitis and Crohn's disease.",
        dosage: "Asthma: 180-360 mcg twice daily. Maximum 720 mcg twice daily. Nasal: 64 mcg per nostril once daily. Crohn's: 9 mg once daily for 8 weeks.",
        sideEffects: [
            "Oral candidiasis",
            "Hoarseness",
            "Throat irritation",
            "Headache",
            "Cough",
            "Upper respiratory infection"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "high", description: "May increase budesonide concentrations" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "May increase systemic exposure" },
            { drug: "Oral corticosteroids", level: "medium", description: "Additive systemic effects" }
        ],
        safety: "Rinse mouth after inhalation to prevent oral candidiasis. Not for relief of acute bronchospasm. Monitor for HPA axis suppression with long-term use. Caution in patients switching from systemic steroids."
    },

    "Fluticasone": {
        class: "Inhaled Corticosteroid",
        brandNames: "Flovent, Flonase, Advair (combination)",
        administration: "Inhalation, Nasal",
        halfLife: "7-8 hours",
        uses: "Fluticasone is used for maintenance treatment of asthma as prophylactic therapy. Also used for allergic and non-allergic rhinitis.",
        dosage: "Asthma: 88-440 mcg twice daily. Maximum 880 mcg twice daily. Allergic rhinitis: 1-2 sprays per nostril once daily.",
        sideEffects: [
            "Headache",
            "Nasal irritation",
            "Pharyngitis",
            "Oral candidiasis",
            "Cough",
            "Upper respiratory infection"
        ],
        interactions: [
            { drug: "Ritonavir", level: "high", description: "Significantly increases fluticasone levels" },
            { drug: "Ketoconazole", level: "high", description: "May increase fluticasone concentrations" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "May increase systemic exposure" }
        ],
        safety: "Rinse mouth after use to prevent oral candidiasis. Not for acute bronchospasm. Monitor growth in pediatric patients. Caution when transferring from systemic corticosteroids."
    },

    "Beclomethasone": {
        class: "Inhaled Corticosteroid",
        brandNames: "QVAR, Beconase",
        administration: "Inhalation, Nasal",
        halfLife: "2.8 hours",
        uses: "Beclomethasone is used for maintenance treatment of asthma and for management of seasonal or perennial allergic rhinitis.",
        dosage: "Asthma: 40-80 mcg twice daily. Maximum 320 mcg twice daily. Allergic rhinitis: 1-2 sprays per nostril twice daily.",
        sideEffects: [
            "Headache",
            "Nasal congestion",
            "Sneezing",
            "Oral candidiasis",
            "Hoarseness",
            "Cough"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "medium", description: "May increase beclomethasone levels" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "Potential for increased systemic exposure" }
        ],
        safety: "Rinse mouth after inhalation to prevent oral candidiasis. Not for relief of acute bronchospasm. Monitor for adrenal insufficiency when switching from oral steroids."
    },

    "Montelukast": {
        class: "Leukotriene Receptor Antagonist",
        brandNames: "Singulair",
        administration: "Oral",
        halfLife: "2.7-5.5 hours",
        uses: "Montelukast is used for prophylaxis and chronic treatment of asthma, relief of seasonal allergic rhinitis symptoms, and prevention of exercise-induced bronchoconstriction.",
        dosage: "Adults: 10 mg once daily in evening. Children 6-14 years: 5 mg chewable tablet daily. Children 2-5 years: 4 mg chewable tablet daily.",
        sideEffects: [
            "Headache",
            "Abdominal pain",
            "Cough",
            "Influenza",
            "Fever",
            "Dizziness"
        ],
        interactions: [
            { drug: "Phenobarbital", level: "medium", description: "May decrease montelukast concentrations" },
            { drug: "Rifampin", level: "medium", description: "May decrease montelukast concentrations" }
        ],
        safety: "Black box warning: Serious neuropsychiatric events including agitation, aggression, depression, and suicidal thinking. Monitor for behavior and mood changes. Not for acute asthma attacks."
    },

    "Theophylline": {
        class: "Methylxanthine",
        brandNames: "Theo-24, Uniphyl, Elixophyllin",
        administration: "Oral, IV",
        halfLife: "3-15 hours (dose-dependent)",
        uses: "Theophylline is used for treatment and prevention of asthma symptoms and bronchospasm associated with chronic bronchitis and emphysema.",
        dosage: "Adults: 300-600 mg daily in divided doses. Must be individualized based on serum concentrations. Therapeutic range: 5-15 mcg/mL.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Headache",
            "Insomnia",
            "Tachycardia",
            "Seizures (at toxic levels)"
        ],
        interactions: [
            { drug: "Cimetidine", level: "high", description: "May increase theophylline levels" },
            { drug: "Ciprofloxacin", level: "high", description: "May increase theophylline levels" },
            { drug: "Phenytoin", level: "high", description: "May decrease theophylline levels" },
            { drug: "Smoking", level: "medium", description: "May decrease theophylline levels" }
        ],
        safety: "Narrow therapeutic index - requires serum concentration monitoring. Risk of seizures at high concentrations. Many drug interactions. Use with caution in patients with cardiac disease."
    },

    "Ipratropium": {
        class: "Anticholinergic",
        brandNames: "Atrovent",
        administration: "Inhalation, Nebulization",
        halfLife: "2 hours",
        uses: "Ipratropium is used for bronchospasm associated with COPD, including chronic bronchitis and emphysema. Also used for rhinorrhea associated with allergic and non-allergic rhinitis.",
        dosage: "COPD: 2 inhalations (34 mcg) four times daily. Maximum 12 inhalations in 24 hours. Nasal: 2 sprays per nostril 2-3 times daily.",
        sideEffects: [
            "Dry mouth",
            "Cough",
            "Headache",
            "Upper respiratory infection",
            "Nasal dryness",
            "Blurred vision (if sprayed in eyes)"
        ],
        interactions: [
            { drug: "Other anticholinergics", level: "medium", description: "Additive anticholinergic effects" }
        ],
        safety: "Not for initial treatment of acute episodes of bronchospasm. Avoid contact with eyes. Use with caution in patients with narrow-angle glaucoma, prostatic hyperplasia, or bladder neck obstruction."
    },

    "Tiotropium": {
        class: "Long-Acting Anticholinergic",
        brandNames: "Spiriva",
        administration: "Inhalation",
        halfLife: "5-6 days",
        uses: "Tiotropium is used for long-term maintenance treatment of bronchospasm associated with COPD, including chronic bronchitis and emphysema.",
        dosage: "COPD: 1 inhalation (18 mcg) once daily using HandiHaler device. Should be taken at the same time each day.",
        sideEffects: [
            "Dry mouth",
            "Upper respiratory infection",
            "Sinusitis",
            "Pharyngitis",
            "Constipation",
            "Urinary retention"
        ],
        interactions: [
            { drug: "Other anticholinergics", level: "high", description: "Additive anticholinergic adverse effects" }
        ],
        safety: "Not for relief of acute bronchospasm. Immediate hypersensitivity reactions may occur. Use with caution in patients with narrow-angle glaucoma, prostatic hyperplasia, or bladder neck obstruction."
    },

    "Cromolyn sodium": {
        class: "Mast Cell Stabilizer",
        brandNames: "Intal, Nasalcrom, Gastrocrom",
        administration: "Inhalation, Nasal, Oral",
        halfLife: "1.3 hours",
        uses: "Cromolyn sodium is used for prophylaxis of asthma symptoms and prevention of exercise-induced bronchospasm. Also used for allergic rhinitis and mastocytosis.",
        dosage: "Asthma: 1 ampule via nebulizer 4 times daily. Nasal: 1 spray per nostril 3-6 times daily. Must be used regularly for effectiveness.",
        sideEffects: [
            "Throat irritation",
            "Cough",
            "Bad taste",
            "Headache",
            "Nausea",
            "Sneezing"
        ],
        interactions: [
            { drug: "None significant", level: "low", description: "No clinically significant drug interactions reported" }
        ],
        safety: "Not for acute asthma attacks. Therapeutic effect may take 2-4 weeks. Must be used regularly for prophylaxis. Discontinue if eosinophilic pneumonia occurs."
    },

    "Zafirlukast": {
        class: "Leukotriene Receptor Antagonist",
        brandNames: "Accolate",
        administration: "Oral",
        halfLife: "10 hours",
        uses: "Zafirlukast is used for prophylaxis and chronic treatment of asthma in adults and children 5 years and older.",
        dosage: "Adults: 20 mg twice daily. Children 5-11 years: 10 mg twice daily. Take at least 1 hour before or 2 hours after meals.",
        sideEffects: [
            "Headache",
            "Nausea",
            "Diarrhea",
            "Infection",
            "Abdominal pain",
            "Dizziness"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "May increase prothrombin time" },
            { drug: "Erythromycin", level: "medium", description: "May decrease zafirlukast levels" },
            { drug: "Theophylline", level: "medium", description: "May decrease zafirlukast levels" }
        ],
        safety: "Risk of hepatic toxicity - monitor liver enzymes. Not for acute asthma attacks. Take on empty stomach. Discontinue if hepatic dysfunction occurs."
    },

    "Mepolizumab": {
        class: "Interleukin-5 Antagonist Monoclonal Antibody",
        brandNames: "Nucala",
        administration: "Subcutaneous injection",
        halfLife: "16-22 days",
        uses: "Mepolizumab is used as add-on maintenance treatment for severe eosinophilic asthma in patients 6 years and older.",
        dosage: "100 mg administered subcutaneously every 4 weeks. Should be administered by healthcare professional or properly trained patient.",
        sideEffects: [
            "Headache",
            "Injection site reactions",
            "Fatigue",
            "Back pain",
            "Urinary tract infection",
            "Hypersensitivity reactions"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Avoid concurrent administration" },
            { drug: "Corticosteroids", level: "medium", description: "Taper corticosteroids gradually" }
        ],
        safety: "Not for treatment of acute bronchospasm or status asthmaticus. Monitor for hypersensitivity reactions. Do not discontinue systemic or inhaled corticosteroids abruptly."
    },

    "Omalizumab": {
        class: "Anti-IgE Monoclonal Antibody",
        brandNames: "Xolair",
        administration: "Subcutaneous injection",
        halfLife: "26 days",
        uses: "Omalizumab is used for moderate to severe persistent asthma in patients 6 years and older who have a positive skin test or in vitro reactivity to a perennial aeroallergen.",
        dosage: "150-375 mg subcutaneously every 2 or 4 weeks, based on IgE level and body weight. Must be administered in healthcare setting.",
        sideEffects: [
            "Injection site reactions",
            "Viral infections",
            "Upper respiratory infection",
            "Headache",
            "Anaphylaxis",
            "Malignancy"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Avoid concurrent administration" }
        ],
        safety: "Black box warning: Anaphylaxis may occur - observe patients for 2 hours after first 3 injections and 30 minutes thereafter. Not for treatment of acute bronchospasm."
    },
    "Cetirizine": {
        class: "Second-generation Antihistamine",
        brandNames: "Zyrtec, Aller-Tec, Alleroff",
        administration: "Oral",
        halfLife: "8.3 hours",
        uses: "Cetirizine is used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, sneezing, hives, and itching.",
        dosage: "Adults and children 6 years and older: 5-10 mg once daily. Children 2-5 years: 2.5 mg once daily, may increase to 5 mg once daily or 2.5 mg every 12 hours.",
        sideEffects: [
            "Drowsiness",
            "Fatigue",
            "Dry mouth",
            "Headache",
            "Sore throat",
            "Dizziness"
        ],
        interactions: [
            { drug: "CNS depressants", level: "medium", description: "May increase sedative effects" },
            { drug: "Theophylline", level: "low", description: "May slightly decrease cetirizine clearance" },
            { drug: "Alcohol", level: "medium", description: "May increase drowsiness" }
        ],
        safety: "Use with caution in patients with renal impairment. May cause drowsiness; avoid driving or operating machinery until response is known."
    },
    "Loratadine": {
        class: "Second-generation Antihistamine",
        brandNames: "Claritin, Alavert, Tavist ND",
        administration: "Oral",
        halfLife: "8.4 hours",
        uses: "Loratadine is used to relieve symptoms of seasonal allergies, including sneezing, runny nose, itchy/watery eyes, and itching of the nose or throat.",
        dosage: "Adults and children 6 years and older: 10 mg once daily. Children 2-5 years: 5 mg once daily.",
        sideEffects: [
            "Headache",
            "Drowsiness",
            "Fatigue",
            "Dry mouth",
            "Nervousness",
            "Stomach pain"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "medium", description: "May increase loratadine levels" },
            { drug: "Erythromycin", level: "medium", description: "May increase loratadine levels" },
            { drug: "Cimetidine", level: "low", description: "May increase loratadine levels" }
        ],
        safety: "Dose adjustment recommended in patients with liver impairment. Generally causes less drowsiness than first-generation antihistamines."
    },
    "Fexofenadine": {
        class: "Second-generation Antihistamine",
        brandNames: "Allegra, Telfast, Fexidine",
        administration: "Oral",
        halfLife: "14.4 hours",
        uses: "Fexofenadine is used to relieve allergy symptoms including sneezing, runny nose, itchy/watery eyes, and hives.",
        dosage: "Adults and children 12+ years: 60 mg twice daily or 180 mg once daily. Children 6-11 years: 30 mg twice daily.",
        sideEffects: [
            "Headache",
            "Back pain",
            "Cough",
            "Diarrhea",
            "Dizziness",
            "Dysmenorrhea"
        ],
        interactions: [
            { drug: "Fruit juices", level: "high", description: "Apple, orange, and grapefruit juice may decrease absorption" },
            { drug: "Antacids", level: "medium", description: "Aluminum and magnesium-containing antacids may decrease absorption" },
            { drug: "Erythromycin", level: "medium", description: "May increase fexofenadine levels" },
            { drug: "Ketoconazole", level: "medium", description: "May increase fexofenadine levels" }
        ],
        safety: "Take on an empty stomach. Avoid taking with fruit juices. Generally non-sedating."
    },
    "Diphenhydramine": {
        class: "First-generation Antihistamine",
        brandNames: "Benadryl, Sominex, Nytol",
        administration: "Oral, Topical, Injection",
        halfLife: "2-8 hours",
        uses: "Diphenhydramine is used to relieve allergy symptoms, treat motion sickness, induce sleep, and relieve cough. Also used for allergic reactions and as a sleep aid.",
        dosage: "Adults: 25-50 mg every 4-6 hours. Maximum 300 mg/day. For sleep: 50 mg at bedtime.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Dizziness",
            "Blurred vision",
            "Constipation",
            "Urinary retention"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Significant increase in sedative effects" },
            { drug: "MAO inhibitors", level: "high", description: "May prolong and intensify anticholinergic effects" },
            { drug: "Alcohol", level: "high", description: "Marked increase in CNS depression" }
        ],
        safety: "Causes significant drowsiness. Avoid driving or operating machinery. Use with caution in elderly patients due to increased risk of confusion and falls."
    },
    "Chlorpheniramine": {
        class: "First-generation Antihistamine",
        brandNames: "Chlor-Trimeton, Aller-Chlor, PediaCare Allergy",
        administration: "Oral, Injection",
        halfLife: "20-24 hours",
        uses: "Chlorpheniramine is used to relieve symptoms of allergies, hay fever, and the common cold, such as sneezing, itching, watery eyes, and runny nose.",
        dosage: "Adults: 4 mg every 4-6 hours, not to exceed 24 mg in 24 hours. Extended-release: 8-12 mg every 8-12 hours.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Dizziness",
            "Headache",
            "Loss of appetite",
            "Upset stomach"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "May intensify anticholinergic effects" },
            { drug: "Alcohol", level: "high", description: "Increases CNS depression" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" }
        ],
        safety: "May cause significant drowsiness. Use with caution in patients with glaucoma, prostate enlargement, or respiratory conditions. Elderly patients may be more sensitive to side effects."
    },
    "Hydroxyzine": {
        class: "First-generation Antihistamine",
        brandNames: "Vistaril, Atarax",
        administration: "Oral, Injection",
        halfLife: "20-25 hours",
        uses: "Hydroxyzine is used to relieve itching caused by allergies, for anxiety, and as a sedative before and after general anesthesia.",
        dosage: "For itching: 25 mg three or four times daily. For anxiety: 50-100 mg four times daily. For sedation: 50-100 mg preoperatively.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Headache",
            "Dizziness",
            "Blurred vision"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Marked increase in CNS depression" },
            { drug: "MAO inhibitors", level: "high", description: "May enhance anticholinergic effects" },
            { drug: "Alcohol", level: "high", description: "Significant increase in sedation" }
        ],
        safety: "May impair mental and physical abilities. Avoid alcohol. Use with caution in patients with cardiovascular disease or glaucoma. Not recommended during pregnancy."
    },
    "Levocetirizine": {
        class: "Second-generation Antihistamine",
        brandNames: "Xyzal",
        administration: "Oral",
        halfLife: "8 hours",
        uses: "Levocetirizine is used to relieve allergy symptoms including sneezing, runny nose, itchy/watery eyes, and hives.",
        dosage: "Adults and children 12+ years: 5 mg once daily in evening. Children 6-11 years: 2.5 mg once daily in evening.",
        sideEffects: [
            "Somnolence",
            "Nasopharyngitis",
            "Fatigue",
            "Dry mouth",
            "Pharyngitis"
        ],
        interactions: [
            { drug: "CNS depressants", level: "low", description: "Minimal interaction reported" },
            { drug: "Theophylline", level: "low", description: "Slight decrease in clearance" },
            { drug: "Ritonavir", level: "medium", description: "May increase levocetirizine exposure" }
        ],
        safety: "Dose adjustment required in renal impairment. May cause drowsiness in some patients. Generally well-tolerated with minimal sedative effects."
    },
    "Desloratadine": {
        class: "Second-generation Antihistamine",
        brandNames: "Clarinex, Aerius",
        administration: "Oral",
        halfLife: "27 hours",
        uses: "Desloratadine is used to relieve allergy symptoms including sneezing, runny nose, itchy/watery eyes, itching of the nose or throat, and hives.",
        dosage: "Adults and children 12+ years: 5 mg once daily. Children 6-11 years: 2.5 mg once daily. Children 12 months-5 years: 1.25 mg once daily.",
        sideEffects: [
            "Headache",
            "Dry mouth",
            "Fatigue",
            "Sore throat",
            "Dizziness",
            "Nausea"
        ],
        interactions: [
            { drug: "Erythromycin", level: "low", description: "Slight increase in desloratadine levels" },
            { drug: "Ketoconazole", level: "low", description: "Slight increase in desloratadine levels" },
            { drug: "Fluoxetine", level: "low", description: "No significant interaction" }
        ],
        safety: "Generally non-sedating. Dose adjustment may be needed in patients with liver or renal impairment. Safe for most patients including those with asthma."
    },
    "Azelastine": {
        class: "Second-generation Antihistamine",
        brandNames: "Astelin, Astepro, Optivar",
        administration: "Nasal spray, Eye drops",
        halfLife: "22 hours",
        uses: "Azelastine nasal spray is used to treat seasonal allergy symptoms. Eye drops are used to treat itchy eyes due to allergies.",
        dosage: "Nasal spray: 1-2 sprays per nostril twice daily. Eye drops: 1 drop in each affected eye twice daily.",
        sideEffects: [
            "Bitter taste",
            "Headache",
            "Nasal burning",
            "Sneezing",
            "Drowsiness",
            "Dry mouth"
        ],
        interactions: [
            { drug: "CNS depressants", level: "low", description: "Minimal systemic interaction due to local administration" },
            { drug: "Alcohol", level: "low", description: "Minimal interaction reported" }
        ],
        safety: "May cause drowsiness in some patients. Avoid spraying in eyes. Temporary burning or stinging may occur after administration."
    },
    "Olopatadine": {
        class: "Second-generation Antihistamine/Mast Cell Stabilizer",
        brandNames: "Patanol, Pataday, Pazeo",
        administration: "Eye drops",
        halfLife: "3 hours",
        uses: "Olopatadine is used to treat itching and redness of the eyes caused by allergies.",
        dosage: "1 drop in each affected eye twice daily (6-8 hours apart). Some formulations are once daily.",
        sideEffects: [
            "Headache",
            "Burning/stinging in eyes",
            "Dry eyes",
            "Foreign body sensation",
            "Blurred vision"
        ],
        interactions: [
            { drug: "Other eye medications", level: "low", description: "Wait at least 5 minutes between different eye drops" },
            { drug: "Contact lenses", level: "low", description: "Remove contacts before administration, wait 10 minutes before reinserting" }
        ],
        safety: "Do not use while wearing contact lenses. May cause temporary blurred vision. Do not touch dropper tip to any surface to avoid contamination."
    },
    "Montelukast": {
        class: "Leukotriene Receptor Antagonist",
        brandNames: "Singulair",
        administration: "Oral",
        halfLife: "2.7-5.5 hours",
        uses: "Montelukast is used to prevent asthma attacks, treat seasonal allergies, and prevent exercise-induced bronchoconstriction.",
        dosage: "Adults 15+ years: 10 mg once daily in evening. Children 6-14 years: 5 mg chewable tablet. Children 2-5 years: 4 mg chewable tablet.",
        sideEffects: [
            "Headache",
            "Upper respiratory infection",
            "Fever",
            "Sore throat",
            "Cough",
            "Stomach pain"
        ],
        interactions: [
            { drug: "Phenobarbital", level: "medium", description: "May decrease montelukast levels" },
            { drug: "Rifampin", level: "medium", description: "May decrease montelukast levels" },
            { drug: "Gemfibrozil", level: "low", description: "Slight increase in montelukast levels" }
        ],
        safety: "FDA boxed warning for serious neuropsychiatric events including suicidal thoughts and behavior. Monitor for changes in mood or behavior. Not for treatment of acute asthma attacks."
    },
    "Ketotifen": {
        class: "Antihistamine/Mast Cell Stabilizer",
        brandNames: "Zaditor, Alaway, Zyrtec Itchy Eye",
        administration: "Eye drops",
        halfLife: "12 hours",
        uses: "Ketotifen is used to prevent itching of the eyes caused by allergies.",
        dosage: "1 drop in each affected eye every 8-12 hours.",
        sideEffects: [
            "Headache",
            "Rhinitis",
            "Burning/stinging in eyes",
            "Dry eyes",
            "Conjunctivitis"
        ],
        interactions: [
            { drug: "Contact lenses", level: "low", description: "Remove contacts before use, wait at least 10 minutes before reinserting" },
            { drug: "Other eye medications", level: "low", description: "Wait at least 5 minutes between different eye drops" }
        ],
        safety: "Do not use while wearing contact lenses. May cause temporary blurred vision. Do not touch dropper tip to eye or any surface."
    },
    "Dimenhydrinate": {
        class: "First-generation Antihistamine",
        brandNames: "Dramamine, Gravol, Trav-L-Tabs",
        administration: "Oral, Injection",
        halfLife: "5-8 hours",
        uses: "Dimenhydrinate is used to prevent and treat nausea, vomiting, and dizziness caused by motion sickness.",
        dosage: "Adults: 50-100 mg every 4-6 hours as needed. Maximum 400 mg in 24 hours. For prevention, take 30-60 minutes before travel.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Urinary retention",
            "Headache"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Marked increase in CNS depression" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" },
            { drug: "MAO inhibitors", level: "high", description: "May intensify anticholinergic effects" }
        ],
        safety: "Causes significant drowsiness. Avoid driving or operating machinery. Use with caution in elderly patients and those with glaucoma, prostate enlargement, or respiratory conditions."
    },
    "Clemastine": {
        class: "First-generation Antihistamine",
        brandNames: "Tavist, Dayhist",
        administration: "Oral",
        halfLife: "21 hours",
        uses: "Clemastine is used to relieve allergy symptoms such as sneezing, runny nose, itching, and watery eyes. Also used for allergic skin reactions.",
        dosage: "Adults: 1.34 mg twice daily, maximum 8.04 mg daily. For allergic skin reactions: 2.68 mg up to three times daily.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Headache",
            "Fatigue",
            "Dizziness",
            "Upset stomach"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "May intensify and prolong anticholinergic effects" },
            { drug: "Alcohol", level: "high", description: "Increases CNS depression" },
            { drug: "Other CNS depressants", level: "high", description: "Enhanced sedative effects" }
        ],
        safety: "May cause significant drowsiness. Avoid alcohol. Use with caution in elderly patients and those with glaucoma, prostate enlargement, or respiratory conditions. May impair mental alertness."
    },

    "Pseudoephedrine": {
        class: "Decongestant",
        brandNames: "Sudafed, Drixoral, Cenafed",
        administration: "Oral",
        halfLife: "4-8 hours",
        uses: "Pseudoephedrine is used for the temporary relief of nasal congestion due to the common cold, hay fever, or other upper respiratory allergies.",
        dosage: "Adults: 60 mg every 4-6 hours. Maximum 240 mg in 24 hours. Extended-release: 120 mg every 12 hours.",
        sideEffects: [
            "Nervousness",
            "Restlessness",
            "Dizziness",
            "Headache",
            "Trouble sleeping",
            "Increased blood pressure"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "May cause dangerous increase in blood pressure" },
            { drug: "Blood pressure medications", level: "medium", description: "May reduce effectiveness" },
            { drug: "Stimulants", level: "medium", description: "Increased risk of side effects" }
        ],
        safety: "Do not use if you have severe high blood pressure, heart disease, or are taking MAO inhibitors. May cause insomnia."
    },

    "Phenylephrine": {
        class: "Decongestant",
        brandNames: "Sudafed PE, Neo-Synephrine",
        administration: "Oral, Nasal spray",
        halfLife: "2-3 hours",
        uses: "Phenylephrine is used for the temporary relief of nasal congestion due to the common cold, hay fever, or other upper respiratory allergies.",
        dosage: "Oral: 10 mg every 4 hours. Nasal: 2-3 sprays in each nostril every 4 hours.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Nervousness",
            "Nausea",
            "Trouble sleeping",
            "Increased blood pressure"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "May cause dangerous increase in blood pressure" },
            { drug: "Beta-blockers", level: "medium", description: "May increase blood pressure" },
            { drug: "Ergot medications", level: "medium", description: "Increased risk of ergot toxicity" }
        ],
        safety: "Do not use if you have high blood pressure, heart disease, diabetes, or thyroid problems without consulting your doctor."
    },

    "Dextromethorphan": {
        class: "Antitussive",
        brandNames: "Robitussin, Delsym, Vicks Formula 44",
        administration: "Oral",
        halfLife: "2-4 hours",
        uses: "Dextromethorphan is used for the temporary relief of cough caused by the common cold, bronchitis, and other breathing illnesses.",
        dosage: "Adults: 10-20 mg every 4 hours or 30 mg every 6-8 hours. Maximum 120 mg per day.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Nausea",
            "Stomach upset",
            "Nervousness"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "May cause serious reactions" },
            { drug: "SSRI antidepressants", level: "medium", description: "Risk of serotonin syndrome" },
            { drug: "Alcohol", level: "medium", description: "Increased drowsiness" }
        ],
        safety: "Do not use with MAO inhibitors. May cause drowsiness - avoid driving or operating machinery. Do not exceed recommended dosage."
    },

    "Guaifenesin": {
        class: "Expectorant",
        brandNames: "Mucinex, Robitussin Chest Congestion",
        administration: "Oral",
        halfLife: "1 hour",
        uses: "Guaifenesin is used to help clear mucus or phlegm from the chest when you have congestion from a cold or flu.",
        dosage: "Adults: 200-400 mg every 4 hours. Maximum 2400 mg per day. Extended-release: 600-1200 mg every 12 hours.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Stomach pain",
            "Dizziness",
            "Headache",
            "Rash"
        ],
        interactions: [
            { drug: "Cough suppressants", level: "low", description: "May counteract effects" },
            { drug: "None significant", level: "low", description: "Few clinically significant interactions" }
        ],
        safety: "Drink plenty of fluids while taking this medication. Contact doctor if cough lasts more than 7 days or is accompanied by fever."
    },

    "Diphenhydramine": {
        class: "Antihistamine",
        brandNames: "Benadryl, Sominex, Nytol",
        administration: "Oral, Topical, Injection",
        halfLife: "2-8 hours",
        uses: "Diphenhydramine is used to relieve symptoms of allergies, hay fever, and the common cold. Also used as a sleep aid and for motion sickness.",
        dosage: "Adults: 25-50 mg every 4-6 hours. Maximum 300 mg per day. For sleep: 50 mg at bedtime.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Dry mouth/nose/throat",
            "Upset stomach",
            "Blurred vision",
            "Headache"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased drowsiness and impairment" },
            { drug: "Other sedatives", level: "high", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause severe drowsiness. Avoid alcohol. Do not use while driving or operating machinery. Not recommended for elderly patients."
    },

    "Chlorpheniramine": {
        class: "Antihistamine",
        brandNames: "Chlor-Trimeton, Aller-Chlor",
        administration: "Oral",
        halfLife: "12-43 hours",
        uses: "Chlorpheniramine is used to treat symptoms of allergies, hay fever, and the common cold such as sneezing, itching, watery eyes, and runny nose.",
        dosage: "Adults: 4 mg every 4-6 hours. Maximum 24 mg per day. Extended-release: 8-12 mg every 8-12 hours.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Dry mouth/nose/throat",
            "Upset stomach",
            "Headache",
            "Increased appetite"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased drowsiness" },
            { drug: "Sedatives", level: "medium", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause drowsiness. Use caution when driving or operating machinery. Avoid alcohol. Not recommended for children under 6 years."
    },

    "Loratadine": {
        class: "Antihistamine (Second Generation)",
        brandNames: "Claritin, Alavert",
        administration: "Oral",
        halfLife: "8-28 hours",
        uses: "Loratadine is used to relieve symptoms of seasonal allergies and chronic hives such as sneezing, runny nose, and itchy/watery eyes.",
        dosage: "Adults and children 6+: 10 mg once daily. Children 2-5: 5 mg once daily.",
        sideEffects: [
            "Headache",
            "Drowsiness",
            "Fatigue",
            "Dry mouth",
            "Nervousness",
            "Stomach upset"
        ],
        interactions: [
            { drug: "Erythromycin", level: "low", description: "May increase loratadine levels" },
            { drug: "Ketoconazole", level: "low", description: "May increase loratadine levels" },
            { drug: "Alcohol", level: "low", description: "Minimal interaction" }
        ],
        safety: "Generally non-sedating. May be taken with or without food. Safe for most patients including those with glaucoma or prostate problems."
    },

    "Cetirizine": {
        class: "Antihistamine (Second Generation)",
        brandNames: "Zyrtec, Aller-Tec",
        administration: "Oral",
        halfLife: "8-11 hours",
        uses: "Cetirizine is used to relieve symptoms of seasonal and perennial allergies, as well as chronic hives.",
        dosage: "Adults and children 6+: 5-10 mg once daily. Children 2-5: 2.5-5 mg once daily.",
        sideEffects: [
            "Drowsiness",
            "Fatigue",
            "Dry mouth",
            "Headache",
            "Sore throat",
            "Stomach pain"
        ],
        interactions: [
            { drug: "Alcohol", level: "medium", description: "May increase drowsiness" },
            { drug: "Theophylline", level: "low", description: "Slight decrease in cetirizine clearance" },
            { drug: "CNS depressants", level: "low", description: "Minimal interaction" }
        ],
        safety: "May cause drowsiness, especially at higher doses. Use caution when driving or operating machinery. Generally safe for long-term use."
    },

    "Oseltamivir": {
        class: "Antiviral (Neuraminidase Inhibitor)",
        brandNames: "Tamiflu",
        administration: "Oral",
        halfLife: "1-10 hours",
        uses: "Oseltamivir is used to treat and prevent influenza (flu) caused by influenza A and B viruses.",
        dosage: "Treatment: 75 mg twice daily for 5 days. Prevention: 75 mg once daily for at least 10 days.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Headache",
            "Diarrhea",
            "Stomach pain",
            "Dizziness"
        ],
        interactions: [
            { drug: "Probenecid", level: "medium", description: "May increase oseltamivir levels" },
            { drug: "Live influenza vaccine", level: "medium", description: "May reduce vaccine effectiveness" },
            { drug: "None significant", level: "low", description: "Few clinically significant interactions" }
        ],
        safety: "Most effective when started within 48 hours of flu symptoms. Not a substitute for flu vaccine. May cause neuropsychiatric events."
    },

    "Zanamivir": {
        class: "Antiviral (Neuraminidase Inhibitor)",
        brandNames: "Relenza",
        administration: "Inhalation",
        halfLife: "2.5-5 hours",
        uses: "Zanamivir is used to treat influenza A and B virus infections in patients who have been symptomatic for no more than 2 days.",
        dosage: "Two 5 mg inhalations (10 mg total) twice daily for 5 days.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Sinusitis",
            "Nasal signs and symptoms",
            "Bronchitis",
            "Cough",
            "Headache",
            "Dizziness"
        ],
        interactions: [
            { drug: "Live influenza vaccine", level: "medium", description: "May reduce vaccine effectiveness" },
            { drug: "Inhaled medications", level: "low", description: "No significant interactions reported" }
        ],
        safety: "Not recommended for patients with underlying respiratory disease. May cause bronchospasm. Use inhaler device properly."
    },

    "Acetaminophen": {
        class: "Analgesic/Antipyretic",
        brandNames: "Tylenol, Panadol, FeverAll",
        administration: "Oral, Rectal, IV",
        halfLife: "1-4 hours",
        uses: "Acetaminophen is used to treat mild to moderate pain and to reduce fever. It is the same medication as Paracetamol.",
        dosage: "Adults: 325-1000 mg every 4-6 hours. Maximum 4000 mg per day. Children: 10-15 mg/kg every 4-6 hours.",
        sideEffects: [
            "Nausea",
            "Stomach pain",
            "Loss of appetite",
            "Headache",
            "Dark urine",
            "Jaundice"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "May increase risk of bleeding" },
            { drug: "Alcohol", level: "high", description: "Increased risk of liver damage" },
            { drug: "Isoniazid", level: "medium", description: "Increased risk of liver toxicity" }
        ],
        safety: "Overdose can cause fatal liver damage. Do not exceed recommended dosage. Many combination products contain acetaminophen - check labels carefully."
    },

    "Codeine": {
        class: "Opioid Analgesic",
        brandNames: "Various combination products",
        administration: "Oral",
        halfLife: "2.5-4 hours",
        uses: "Codeine is used to treat mild to moderately severe pain. Also used as a cough suppressant in lower doses.",
        dosage: "Pain: 15-60 mg every 4-6 hours. Cough: 10-20 mg every 4-6 hours. Maximum 360 mg daily.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Nausea",
            "Vomiting",
            "Constipation",
            "Lightheadedness",
            "Sweating"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Benzodiazepines", level: "high", description: "Increased respiratory depression" },
            { drug: "MAO inhibitors", level: "high", description: "Serious reactions possible" }
        ],
        safety: "Risk of addiction, abuse, and misuse. May cause life-threatening respiratory depression. Not recommended for children."
    },

    "Bromhexine": {
        class: "Mucolytic",
        brandNames: "Bisolvon, Broxin",
        administration: "Oral",
        halfLife: "6-8 hours",
        uses: "Bromhexine is used to help clear mucus from the airways in conditions such as chronic bronchitis, asthma, and other respiratory disorders.",
        dosage: "Adults: 8-16 mg three times daily. Children: 4 mg three times daily.",
        sideEffects: [
            "Gastrointestinal upset",
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Headache",
            "Dizziness",
            "Rash"
        ],
        interactions: [
            { drug: "Antibiotics", level: "low", description: "May increase antibiotic penetration into lung tissue" },
            { drug: "None significant", level: "low", description: "Few clinically significant interactions" }
        ],
        safety: "Drink plenty of fluids while taking this medication. Not recommended during first trimester of pregnancy. Use with caution in patients with gastric ulcers."
    },

    "Ambroxol": {
        class: "Mucolytic",
        brandNames: "Mucosolvan, Lasolvan",
        administration: "Oral, Inhalation",
        halfLife: "7-12 hours",
        uses: "Ambroxol is used to treat respiratory diseases associated with viscid mucus. It helps clear mucus from the airways.",
        dosage: "Adults: 30 mg three times daily. Maximum 120 mg daily. Extended-release: 75 mg once or twice daily.",
        sideEffects: [
            "Gastrointestinal discomfort",
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Dyspepsia",
            "Rash",
            "Headache"
        ],
        interactions: [
            { drug: "Antibiotics", level: "low", description: "May increase antibiotic concentration in lung tissue" },
            { drug: "Cough suppressants", level: "low", description: "May counteract effects" }
        ],
        safety: "Drink plenty of fluids. Not recommended during first trimester of pregnancy. Use with caution in patients with gastric ulcers."
    },

    "Oxymetazoline": {
        class: "Decongestant",
        brandNames: "Afrin, Dristan, Vicks Sinex",
        administration: "Nasal spray",
        halfLife: "5-8 hours",
        uses: "Oxymetazoline is used for the temporary relief of nasal congestion due to the common cold, hay fever, or other upper respiratory allergies.",
        dosage: "Adults and children 6+: 2-3 sprays in each nostril every 10-12 hours. Do not use for more than 3 days.",
        sideEffects: [
            "Temporary burning",
            "Stinging",
            "Sneezing",
            "Dry nose",
            "Increased nasal congestion",
            "Headache"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "medium", description: "May increase blood pressure" },
            { drug: "None significant", level: "low", description: "Few systemic interactions due to topical use" }
        ],
        safety: "Do not use for more than 3 days. Rebound congestion may occur with prolonged use. Not recommended for children under 6 years."
    },

    "Xylometazoline": {
        class: "Decongestant",
        brandNames: "Otrivin, Nasivin",
        administration: "Nasal spray/drops",
        halfLife: "Unknown",
        uses: "Xylometazoline is used for the temporary relief of nasal congestion due to the common cold, sinusitis, hay fever, or other respiratory allergies.",
        dosage: "Adults and children 12+: 1 spray or 2-3 drops in each nostril every 8-10 hours. Do not use for more than 3-5 days.",
        sideEffects: [
            "Temporary burning",
            "Stinging",
            "Sneezing",
            "Dry nose",
            "Headache",
            "Nervousness"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "medium", description: "May increase blood pressure" },
            { drug: "Tricyclic antidepressants", level: "low", description: "Possible increased effects" }
        ],
        safety: "Risk of rebound congestion with prolonged use. Do not use for more than 3-5 days continuously. Not recommended for children under 12 years."
    },

    "Camphor": {
        class: "Topical Analgesic",
        brandNames: "Vicks VapoRub, Tiger Balm",
        administration: "Topical",
        halfLife: "Unknown",
        uses: "Camphor is used topically to relieve pain, itching, and irritation. Also used as a cough suppressant in vaporized form.",
        dosage: "Apply to affected area 3-4 times daily. Do not use on broken skin.",
        sideEffects: [
            "Skin irritation",
            "Redness",
            "Burning sensation",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "None significant", level: "low", description: "Minimal systemic absorption when used topically" }
        ],
        safety: "For external use only. Do not ingest - can be toxic if swallowed. Do not apply to broken skin. Keep away from eyes and mucous membranes."
    },

    "Menthol": {
        class: "Topical Analgesic/Cooling Agent",
        brandNames: "Vicks VapoRub, Bengay, Icy Hot",
        administration: "Topical, Inhalation",
        halfLife: "Unknown",
        uses: "Menthol is used topically to relieve minor aches and pains, and as an inhalant to relieve cough and nasal congestion.",
        dosage: "Apply to affected area 3-4 times daily. For inhalation: use as directed on product.",
        sideEffects: [
            "Mild skin irritation",
            "Redness",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "None significant", level: "low", description: "Minimal systemic absorption when used properly" }
        ],
        safety: "For external use only. Do not apply to broken skin. Do not use on children under 2 years. May cause skin sensitivity in some individuals."
    },

    "Phenylpropanolamine": {
        class: "Decongestant",
        brandNames: "Previously in many cold medications",
        administration: "Oral",
        halfLife: "3-4 hours",
        uses: "Phenylpropanolamine was used for the temporary relief of nasal congestion due to the common cold, hay fever, or other upper respiratory allergies.",
        dosage: "Previously: 25 mg every 4 hours or 75 mg extended-release every 12 hours.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Nervousness",
            "Insomnia",
            "Increased blood pressure",
            "Rapid heart rate"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Dangerous increase in blood pressure" },
            { drug: "Blood pressure medications", level: "medium", description: "May reduce effectiveness" },
            { drug: "Stimulants", level: "medium", description: "Increased risk of side effects" }
        ],
        safety: "Removed from market in many countries due to increased risk of hemorrhagic stroke. Not recommended for use. Safer alternatives available."
    },
    "Amoxicillin": {
        class: "Penicillin Antibiotic",
        brandNames: "Amoxil, Trimox, Moxatag",
        administration: "Oral",
        halfLife: "61.3 minutes",
        uses: "Amoxicillin is used to treat many different types of bacterial infections, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.",
        dosage: "Adults: 250-500 mg every 8 hours or 500-875 mg every 12 hours. Children: 20-90 mg/kg/day in divided doses every 8-12 hours.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Stomach pain",
            "Skin rash",
            "Vaginal itching or discharge"
        ],
        interactions: [
            { drug: "Methotrexate", level: "high", description: "May increase methotrexate toxicity" },
            { drug: "Oral contraceptives", level: "medium", description: "May reduce contraceptive effectiveness" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Allopurinol", level: "medium", description: "Increased risk of skin rash" }
        ],
        safety: "May cause severe allergic reactions in penicillin-sensitive patients. Complete the full course of treatment even if symptoms disappear. May cause antibiotic-associated colitis."
    },

    "Azithromycin": {
        class: "Macrolide Antibiotic",
        brandNames: "Zithromax, Z-Pak, Azithrocin",
        administration: "Oral, IV",
        halfLife: "68 hours",
        uses: "Azithromycin is used to treat many different types of bacterial infections, including respiratory infections, skin infections, ear infections, and sexually transmitted diseases.",
        dosage: "Common dosage: 500 mg on day 1, then 250 mg daily for days 2-5. Single dose of 1 gram for some STIs.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Abdominal pain",
            "Headache",
            "Dizziness"
        ],
        interactions: [
            { drug: "Antacids", level: "medium", description: "Take azithromycin 1 hour before or 2 hours after antacids" },
            { drug: "Warfarin", level: "high", description: "May increase anticoagulant effect" },
            { drug: "Nelfinavir", level: "high", description: "Increased azithromycin levels" }
        ],
        safety: "May cause serious heart rhythm problems. Use with caution in patients with existing heart conditions. May worsen myasthenia gravis."
    },

    "Clarithromycin": {
        class: "Macrolide Antibiotic",
        brandNames: "Biaxin, Klaricid",
        administration: "Oral",
        halfLife: "3-4 hours",
        uses: "Clarithromycin is used to treat various bacterial infections, including respiratory tract infections, skin infections, and Helicobacter pylori infections.",
        dosage: "Adults: 250-500 mg every 12 hours for 7-14 days. Take with or without food.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Abnormal taste",
            "Headache",
            "Stomach pain"
        ],
        interactions: [
            { drug: "Statins", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Colchicine", level: "high", description: "Increased colchicine toxicity" },
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" }
        ],
        safety: "May cause serious heart rhythm problems. Contraindicated with certain medications due to CYP3A4 inhibition. Monitor for liver function abnormalities."
    },

    "Doxycycline": {
        class: "Tetracycline Antibiotic",
        brandNames: "Vibramycin, Doryx, Monodox",
        administration: "Oral, IV",
        halfLife: "18-22 hours",
        uses: "Doxycycline is used to treat many different bacterial infections, including acne, urinary tract infections, intestinal infections, and certain sexually transmitted diseases.",
        dosage: "Adults: 100 mg twice daily on first day, then 100 mg daily. For severe infections: 100 mg every 12 hours.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Photosensitivity",
            "Tooth discoloration (in children)"
        ],
        interactions: [
            { drug: "Antacids", level: "high", description: "Reduced absorption - take 2 hours apart" },
            { drug: "Iron supplements", level: "high", description: "Reduced absorption - take 2 hours apart" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "May cause permanent tooth discoloration if used during tooth development. Avoid excessive sun exposure. Not recommended during pregnancy or in children under 8 years."
    },

    "Ciprofloxacin": {
        class: "Fluoroquinolone Antibiotic",
        brandNames: "Cipro, Cipro XR",
        administration: "Oral, IV, Ophthalmic",
        halfLife: "4 hours",
        uses: "Ciprofloxacin is used to treat different types of bacterial infections, including urinary tract infections, abdominal infections, and certain types of diarrhea.",
        dosage: "Adults: 250-750 mg every 12 hours. Duration depends on type and severity of infection.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Headache",
            "Dizziness",
            "Tendon inflammation or rupture"
        ],
        interactions: [
            { drug: "Theophylline", level: "high", description: "Increased theophylline levels" },
            { drug: "Antacids", level: "high", description: "Reduced absorption - take 2 hours apart" },
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" }
        ],
        safety: "May cause tendon inflammation or rupture, especially in elderly patients. May worsen muscle weakness in patients with myasthenia gravis. Serious side effects may include peripheral neuropathy."
    },

    "Levofloxacin": {
        class: "Fluoroquinolone Antibiotic",
        brandNames: "Levaquin, Tavanic",
        administration: "Oral, IV, Ophthalmic",
        halfLife: "6-8 hours",
        uses: "Levofloxacin is used to treat various bacterial infections, including pneumonia, skin infections, and urinary tract infections.",
        dosage: "Adults: 250-750 mg once daily. Duration varies by infection type.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Headache",
            "Insomnia",
            "Tendon problems"
        ],
        interactions: [
            { drug: "Antacids", level: "high", description: "Reduced absorption - take 2 hours apart" },
            { drug: "NSAIDs", level: "medium", description: "Increased risk of CNS stimulation" },
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" }
        ],
        safety: "Risk of tendonitis and tendon rupture. May cause peripheral neuropathy. Use with caution in patients with CNS disorders. Avoid in patients with myasthenia gravis."
    },

    "Metronidazole": {
        class: "Nitroimidazole Antibiotic",
        brandNames: "Flagyl, MetroCream, Noritate",
        administration: "Oral, IV, Topical, Vaginal",
        halfLife: "8 hours",
        uses: "Metronidazole is used to treat various parasitic and bacterial infections, including abdominal infections, gynecological infections, and certain types of diarrhea.",
        dosage: "Adults: 500 mg three times daily or 750 mg three times daily. Duration depends on infection type.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Metallic taste",
            "Dark urine",
            "Dizziness"
        ],
        interactions: [
            { drug: "Alcohol", level: "high", description: "May cause disulfiram-like reaction" },
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" },
            { drug: "Lithium", level: "medium", description: "May increase lithium levels" }
        ],
        safety: "Avoid alcohol during treatment and for at least 3 days after completion. May cause neurological side effects with prolonged use. Use with caution in patients with liver disease."
    },

    "Clindamycin": {
        class: "Lincosamide Antibiotic",
        brandNames: "Cleocin, Dalacin, Clindagel",
        administration: "Oral, IV, Topical, Vaginal",
        halfLife: "2-3 hours",
        uses: "Clindamycin is used to treat serious bacterial infections, including bone infections, abdominal infections, and certain types of pneumonia.",
        dosage: "Adults: 150-450 mg every 6-8 hours. Severe infections may require higher doses.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Abdominal pain",
            "Skin rash"
        ],
        interactions: [
            { drug: "Neuromuscular blocking agents", level: "high", description: "Enhanced neuromuscular blockade" },
            { drug: "Erythromycin", level: "medium", description: "Antagonistic effect" }
        ],
        safety: "High risk of causing Clostridium difficile-associated diarrhea. Use with caution in patients with gastrointestinal diseases. Monitor for signs of pseudomembranous colitis."
    },

    "Cephalexin": {
        class: "First-generation Cephalosporin",
        brandNames: "Keflex, Ceporex",
        administration: "Oral",
        halfLife: "0.5-1.2 hours",
        uses: "Cephalexin is used to treat bacterial infections in different parts of the body, including respiratory tract infections, ear infections, skin infections, and bone infections.",
        dosage: "Adults: 250-500 mg every 6 hours. Maximum dose 4 grams per day.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Stomach pain",
            "Skin rash"
        ],
        interactions: [
            { drug: "Metformin", level: "medium", description: "May increase metformin levels" },
            { drug: "Probenecid", level: "medium", description: "May increase cephalexin levels" }
        ],
        safety: "May cause allergic reactions in penicillin-sensitive patients. Use with caution in patients with renal impairment. May cause antibiotic-associated diarrhea."
    },

    "Ceftriaxone": {
        class: "Third-generation Cephalosporin",
        brandNames: "Rocephin",
        administration: "IV, IM",
        halfLife: "5.8-8.7 hours",
        uses: "Ceftriaxone is used to treat many kinds of bacterial infections, including serious infections such as meningitis, and infections of the lungs, ears, skin, urinary tract, and blood.",
        dosage: "Adults: 1-2 grams once daily. Meningitis: 2 grams every 12 hours.",
        sideEffects: [
            "Diarrhea",
            "Rash",
            "Pain at injection site",
            "Elevated liver enzymes",
            "Gallbladder complications"
        ],
        interactions: [
            { drug: "Calcium-containing products", level: "high", description: "Risk of precipitation in neonates" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "May cause severe skin reactions. Use with caution in patients with gallbladder disease. Monitor for signs of hemolytic anemia. Not to be administered with calcium-containing solutions in neonates."
    },

    "Cefuroxime": {
        class: "Second-generation Cephalosporin",
        brandNames: "Ceftin, Zinacef",
        administration: "Oral, IV, IM",
        halfLife: "1-2 hours",
        uses: "Cefuroxime is used to treat bacterial infections of the ear, throat, lungs, urinary tract, and skin. It is also used to treat gonorrhea.",
        dosage: "Adults: 250-500 mg twice daily. Maximum dose 1 gram per day.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Headache",
            "Vaginal itching"
        ],
        interactions: [
            { drug: "Probenecid", level: "medium", description: "May increase cefuroxime levels" },
            { drug: "Antacids", level: "medium", description: "May reduce absorption" }
        ],
        safety: "May cause allergic reactions in penicillin-sensitive patients. Use with caution in patients with gastrointestinal disease. Complete full course of treatment."
    },

    "Cefotaxime": {
        class: "Third-generation Cephalosporin",
        brandNames: "Claforan",
        administration: "IV, IM",
        halfLife: "1 hour",
        uses: "Cefotaxime is used to treat serious infections caused by susceptible bacteria, including meningitis, sepsis, and infections of the respiratory tract, urinary tract, and abdomen.",
        dosage: "Adults: 1-2 grams every 6-8 hours. Severe infections: 2 grams every 4 hours.",
        sideEffects: [
            "Diarrhea",
            "Rash",
            "Pain at injection site",
            "Fever",
            "Headache"
        ],
        interactions: [
            { drug: "Aminoglycosides", level: "medium", description: "Increased risk of kidney damage" },
            { drug: "Probenecid", level: "medium", description: "May increase cefotaxime levels" }
        ],
        safety: "May cause severe skin reactions. Use with caution in patients with renal impairment. Monitor for signs of superinfection."
    },

    "Penicillin G": {
        class: "Natural Penicillin",
        brandNames: "Pfizerpen, Pentids",
        administration: "IV, IM",
        halfLife: "30-60 minutes",
        uses: "Penicillin G is used to treat many different types of severe infections, including syphilis, meningitis, endocarditis, and serious respiratory infections.",
        dosage: "Dose varies widely by infection type. Range: 1-24 million units per day in divided doses.",
        sideEffects: [
            "Allergic reactions",
            "Diarrhea",
            "Nausea",
            "Fever",
            "Rash"
        ],
        interactions: [
            { drug: "Probenecid", level: "medium", description: "Increased penicillin levels" },
            { drug: "Tetracyclines", level: "medium", description: "Antagonistic effect" }
        ],
        safety: "High risk of allergic reactions. Perform skin test in patients with penicillin allergy history. Use with caution in patients with renal impairment."
    },

    "Ampicillin": {
        class: "Aminopenicillin",
        brandNames: "Principen, Omnipen",
        administration: "Oral, IV, IM",
        halfLife: "1-1.8 hours",
        uses: "Ampicillin is used to treat many different types of infections caused by bacteria, such as ear infections, bladder infections, pneumonia, and salmonella infections.",
        dosage: "Adults: 250-500 mg every 6 hours. Severe infections: 1-2 grams every 4-6 hours.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Rash",
            "Vaginal itching",
            "Headache"
        ],
        interactions: [
            { drug: "Allopurinol", level: "medium", description: "Increased risk of rash" },
            { drug: "Oral contraceptives", level: "medium", description: "May reduce effectiveness" }
        ],
        safety: "May cause severe allergic reactions. High incidence of rash, especially with concurrent viral infections. Use with caution in patients with mononucleosis."
    },

    "Vancomycin": {
        class: "Glycopeptide Antibiotic",
        brandNames: "Vancocin, Firvanq",
        administration: "Oral, IV",
        halfLife: "4-6 hours",
        uses: "Vancomycin is used to treat serious bacterial infections caused by susceptible strains of methicillin-resistant Staphylococcus aureus (MRSA).",
        dosage: "IV: 15-20 mg/kg every 8-12 hours. Oral: 125-500 mg every 6 hours for C. difficile.",
        sideEffects: [
            "Nephrotoxicity",
            "Ototoxicity",
            "Red man syndrome",
            "Thrombophlebitis",
            "Fever"
        ],
        interactions: [
            { drug: "Aminoglycosides", level: "high", description: "Increased risk of kidney damage" },
            { drug: "Anesthetic agents", level: "medium", description: "Increased risk of hypotension" }
        ],
        safety: "Monitor serum levels to avoid toxicity. Risk of nephrotoxicity and ototoxicity. Infuse slowly to prevent red man syndrome. Use with caution in patients with renal impairment."
    },

    "Linezolid": {
        class: "Oxazolidinone Antibiotic",
        brandNames: "Zyvox, Zyvoxam",
        administration: "Oral, IV",
        halfLife: "5 hours",
        uses: "Linezolid is used to treat certain serious bacterial infections that have not responded to other antibiotics, including MRSA and VRE infections.",
        dosage: "Adults: 600 mg every 12 hours. Duration typically 10-28 days.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Headache",
            "Myelosuppression",
            "Peripheral neuropathy"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Risk of serotonin syndrome" },
            { drug: "MAOIs", level: "high", description: "Risk of hypertensive crisis" },
            { drug: "Tyramine-rich foods", level: "medium", description: "Possible pressor response" }
        ],
        safety: "May cause bone marrow suppression with prolonged use. Monitor blood counts weekly. Risk of peripheral and optic neuropathy with extended use. Avoid in patients taking SSRIs."
    },

    "Gentamicin": {
        class: "Aminoglycoside Antibiotic",
        brandNames: "Garamycin, Gentak",
        administration: "IV, IM, Topical, Ophthalmic",
        halfLife: "2-3 hours",
        uses: "Gentamicin is used to treat serious bacterial infections caused by susceptible strains, including sepsis, meningitis, and urinary tract infections.",
        dosage: "3-5 mg/kg/day in divided doses every 8 hours. Monitor serum levels.",
        sideEffects: [
            "Nephrotoxicity",
            "Ototoxicity",
            "Neuromuscular blockade",
            "Nausea",
            "Rash"
        ],
        interactions: [
            { drug: "Other nephrotoxic drugs", level: "high", description: "Increased kidney damage risk" },
            { drug: "Neuromuscular blockers", level: "high", description: "Enhanced paralysis" },
            { drug: "Loop diuretics", level: "medium", description: "Increased ototoxicity risk" }
        ],
        safety: "Monitor serum levels to avoid toxicity. High risk of kidney damage and hearing loss. Use with caution in patients with renal impairment. Hydrate patient during therapy."
    },

    "Tobramycin": {
        class: "Aminoglycoside Antibiotic",
        brandNames: "Nebcin, Tobi, Tobrex",
        administration: "IV, IM, Inhalation, Ophthalmic",
        halfLife: "2-3 hours",
        uses: "Tobramycin is used to treat serious bacterial infections, especially Pseudomonas aeruginosa infections, and for inhalation in cystic fibrosis patients.",
        dosage: "IV: 3-5 mg/kg/day in divided doses. Inhalation: 300 mg twice daily.",
        sideEffects: [
            "Nephrotoxicity",
            "Ototoxicity",
            "Neuromuscular blockade",
            "Respiratory paralysis",
            "Rash"
        ],
        interactions: [
            { drug: "Other aminoglycosides", level: "high", description: "Increased toxicity" },
            { drug: "Vancomycin", level: "high", description: "Increased kidney damage risk" },
            { drug: "Loop diuretics", level: "medium", description: "Increased ototoxicity risk" }
        ],
        safety: "Monitor serum levels carefully. Risk of permanent hearing loss and kidney damage. Use with caution in patients with neuromuscular disorders. Maintain adequate hydration."
    },

    "Erythromycin": {
        class: "Macrolide Antibiotic",
        brandNames: "Ery-Tab, E.E.S., Eryc",
        administration: "Oral, IV, Topical, Ophthalmic",
        halfLife: "1.5-2 hours",
        uses: "Erythromycin is used to treat many different types of bacterial infections, including respiratory tract infections, skin infections, and certain sexually transmitted diseases.",
        dosage: "Adults: 250-500 mg every 6-12 hours. Maximum 4 grams per day.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Abdominal pain",
            "Hearing loss (high doses)"
        ],
        interactions: [
            { drug: "Statins", level: "high", description: "Increased risk of muscle problems" },
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" },
            { drug: "Theophylline", level: "medium", description: "Increased theophylline levels" }
        ],
        safety: "May cause serious heart rhythm problems. High doses may cause reversible hearing loss. Use with caution in patients with liver disease. May cause gastrointestinal irritation."
    },

    "Tetracycline": {
        class: "Tetracycline Antibiotic",
        brandNames: "Sumycin, Panmycin",
        administration: "Oral",
        halfLife: "6-11 hours",
        uses: "Tetracycline is used to treat many different bacterial infections, including acne, urinary tract infections, and certain sexually transmitted diseases.",
        dosage: "Adults: 250-500 mg every 6 hours. Take on empty stomach.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Photosensitivity",
            "Tooth discoloration"
        ],
        interactions: [
            { drug: "Antacids", level: "high", description: "Reduced absorption" },
            { drug: "Iron supplements", level: "high", description: "Reduced absorption" },
            { drug: "Oral contraceptives", level: "medium", description: "Reduced effectiveness" }
        ],
        safety: "Contraindicated in pregnancy and children under 8 years due to tooth discoloration. Avoid excessive sun exposure. May cause esophageal irritation - take with full glass of water."
    },

    "Sulfamethoxazole/Trimethoprim": {
        class: "Sulfonamide Antibiotic",
        brandNames: "Bactrim, Septra, Cotrim",
        administration: "Oral, IV",
        halfLife: "SMX: 9-11 hours, TMP: 8-10 hours",
        uses: "This combination antibiotic is used to treat various bacterial infections, including urinary tract infections, ear infections, bronchitis, and Pneumocystis jirovecii pneumonia.",
        dosage: "Adults: 1-2 DS tablets every 12 hours. PJP prophylaxis: 1 DS tablet daily.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Rash",
            "Photosensitivity",
            "Blood dyscrasias"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased anticoagulant effect" },
            { drug: "Methotrexate", level: "high", description: "Increased methotrexate toxicity" },
            { drug: "ACE inhibitors", level: "medium", description: "Increased risk of hyperkalemia" }
        ],
        safety: "May cause severe skin reactions including Stevens-Johnson syndrome. Monitor blood counts during prolonged therapy. Use with caution in patients with G6PD deficiency. Maintain adequate hydration."
    },

    "Rifampin": {
        class: "Rifamycin Antibiotic",
        brandNames: "Rifadin, Rimactane",
        administration: "Oral, IV",
        halfLife: "3-4 hours",
        uses: "Rifampin is used to treat tuberculosis and other bacterial infections. It is also used to eliminate meningococci from the nasopharynx of asymptomatic carriers.",
        dosage: "TB treatment: 10 mg/kg/day (max 600 mg). Meningococcal prophylaxis: 600 mg twice daily for 2 days.",
        sideEffects: [
            "Orange discoloration of body fluids",
            "Hepatotoxicity",
            "Nausea",
            "Rash",
            "Flu-like syndrome"
        ],
        interactions: [
            { drug: "Many medications", level: "high", description: "Strong CYP450 inducer" },
            { drug: "Oral contraceptives", level: "high", description: "Reduced effectiveness" },
            { drug: "Warfarin", level: "high", description: "Reduced anticoagulant effect" }
        ],
        safety: "Strong liver enzyme inducer - affects many medications. Monitor liver function tests. Body fluids may turn orange-red. Use with caution in patients with liver disease."
    },

    "Isoniazid": {
        class: "Antituberculosis Agent",
        brandNames: "INH, Nydrazid",
        administration: "Oral, IM",
        halfLife: "0.5-1.6 hours (fast acetylators), 2-5 hours (slow acetylators)",
        uses: "Isoniazid is used to treat and prevent tuberculosis. It is always used in combination with other antituberculosis medications.",
        dosage: "Treatment: 5 mg/kg/day (max 300 mg). Prophylaxis: 300 mg daily.",
        sideEffects: [
            "Peripheral neuropathy",
            "Hepatotoxicity",
            "Nausea",
            "Rash",
            "Pyridoxine deficiency"
        ],
        interactions: [
            { drug: "Antacids", level: "medium", description: "Reduced absorption" },
            { drug: "Phenytoin", level: "high", description: "Increased phenytoin levels" },
            { drug: "Carbamazepine", level: "high", description: "Increased carbamazepine levels" }
        ],
        safety: "High risk of liver toxicity - monitor liver enzymes. Give pyridoxine to prevent peripheral neuropathy. Use with caution in patients with alcohol use disorder."
    },

    "Meropenem": {
        class: "Carbapenem Antibiotic",
        brandNames: "Merrem",
        administration: "IV",
        halfLife: "1 hour",
        uses: "Meropenem is used to treat serious bacterial infections including meningitis, intra-abdominal infections, and complicated skin infections.",
        dosage: "Adults: 1 gram every 8 hours. Meningitis: 2 grams every 8 hours.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Headache",
            "Rash",
            "Seizures (high doses)"
        ],
        interactions: [
            { drug: "Valproic acid", level: "high", description: "Reduced valproic acid levels" },
            { drug: "Probenecid", level: "medium", description: "Increased meropenem levels" }
        ],
        safety: "May reduce valproic acid levels significantly. Use with caution in patients with CNS disorders due to seizure risk. Monitor for superinfection."
    },

    "Imipenem": {
        class: "Carbapenem Antibiotic",
        brandNames: "Primaxin",
        administration: "IV",
        halfLife: "1 hour",
        uses: "Imipenem is used to treat serious bacterial infections caused by susceptible organisms, including lower respiratory tract infections, urinary tract infections, and intra-abdominal infections.",
        dosage: "Adults: 250-500 mg every 6 hours. Severe infections: 1 gram every 6-8 hours.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Seizures",
            "Rash",
            "Phlebitis"
        ],
        interactions: [
            { drug: "Ganciclovir", level: "high", description: "Increased seizure risk" },
            { drug: "Probenecid", level: "medium", description: "Increased imipenem levels" }
        ],
        safety: "High risk of seizures, especially with renal impairment or CNS disorders. Always administered with cilastatin to prevent renal metabolism. Adjust dose in renal impairment."
    },

    "Aztreonam": {
        class: "Monobactam Antibiotic",
        brandNames: "Azactam, Cayston",
        administration: "IV, IM, Inhalation",
        halfLife: "1.7-2.9 hours",
        uses: "Aztreonam is used to treat infections caused by gram-negative bacteria, including Pseudomonas aeruginosa. Inhalation form is used for cystic fibrosis patients.",
        dosage: "IV: 1-2 grams every 6-12 hours. Inhalation: 75 mg three times daily.",
        sideEffects: [
            "Rash",
            "Diarrhea",
            "Nausea",
            "Chest discomfort (inhalation)",
            "Phlebitis"
        ],
        interactions: [
            { drug: "Cefoxitin", level: "medium", description: "Antagonistic effect" },
            { drug: "Imipenem", level: "medium", description: "Antagonistic effect" }
        ],
        safety: "Generally safe in penicillin-allergic patients. Monitor renal function with IV administration. Inhalation may cause bronchospasm - premedicate with bronchodilator."
    },

    "Fosfomycin": {
        class: "Phosphonic Acid Antibiotic",
        brandNames: "Monurol",
        administration: "Oral",
        halfLife: "5.7 hours",
        uses: "Fosfomycin is used to treat uncomplicated urinary tract infections in women. It is particularly effective against E. coli and Enterococcus faecalis.",
        dosage: "Single 3 gram sachet dissolved in water. Take on empty stomach.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Headache",
            "Vaginitis",
            "Dizziness"
        ],
        interactions: [
            { drug: "Metoclopramide", level: "medium", description: "Reduced fosfomycin levels" },
            { drug: "Antacids", level: "medium", description: "May reduce absorption" }
        ],
        safety: "Single-dose therapy for uncomplicated UTIs. Not recommended for complicated infections. Use with caution in patients with renal impairment."
    },

    "Nitrofurantoin": {
        class: "Nitrofuran Antibiotic",
        brandNames: "Macrobid, Macrodantin, Furadantin",
        administration: "Oral",
        halfLife: "20 minutes",
        uses: "Nitrofurantoin is used to treat and prevent urinary tract infections caused by susceptible strains of bacteria.",
        dosage: "Treatment: 50-100 mg four times daily. Prophylaxis: 50-100 mg at bedtime.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Dizziness",
            "Pulmonary reactions",
            "Peripheral neuropathy"
        ],
        interactions: [
            { drug: "Antacids", level: "medium", description: "Reduced absorption" },
            { drug: "Probenecid", level: "medium", description: "Reduced effectiveness" },
            { drug: "Uricosuric agents", level: "medium", description: "Reduced effectiveness" }
        ],
        safety: "Contraindicated in renal impairment (CrCl <60 mL/min). Risk of pulmonary fibrosis and peripheral neuropathy with long-term use. Monitor for signs of hepatotoxicity."
    },
    "Prednisone": {
        class: "Corticosteroid",
        brandNames: "Deltasone, Rayos, Prednisone Intensol",
        administration: "Oral",
        halfLife: "2-3 hours",
        uses: "Prednisone is used to treat inflammatory conditions, allergic disorders, autoimmune diseases, and certain types of cancer. It helps reduce inflammation and suppress the immune system.",
        dosage: "Dosage varies widely based on condition. For inflammation: 5-60 mg daily. Always taper gradually when discontinuing long-term therapy.",
        sideEffects: [
            "Increased appetite and weight gain",
            "Fluid retention and swelling",
            "High blood pressure",
            "Mood changes or mood swings",
            "Elevated blood sugar",
            "Increased risk of infections",
            "Osteoporosis with long-term use"
        ],
        interactions: [
            { drug: "NSAIDs", level: "high", description: "Increased risk of gastrointestinal bleeding" },
            { drug: "Warfarin", level: "medium", description: "May alter anticoagulant effect" },
            { drug: "Diuretics", level: "medium", description: "May increase potassium loss" },
            { drug: "Vaccines", level: "high", description: "May reduce vaccine effectiveness" }
        ],
        safety: "Do not stop suddenly after long-term use. Taper gradually under medical supervision. Monitor for adrenal insufficiency. Increased risk of infections."
    },
    "Methylprednisolone": {
        class: "Corticosteroid",
        brandNames: "Medrol, Depo-Medrol, Solu-Medrol",
        administration: "Oral, Intravenous, Intramuscular",
        halfLife: "18-36 hours",
        uses: "Used for severe inflammatory conditions, allergic reactions, and autoimmune disorders. Also used in cancer treatment and organ transplantation.",
        dosage: "Oral: 4-48 mg daily. IV: Varies by condition. Always individualize dose based on condition being treated.",
        sideEffects: [
            "Insomnia",
            "Increased blood pressure",
            "Fluid retention",
            "Mood changes",
            "Increased blood sugar",
            "Gastrointestinal upset",
            "Increased risk of infection"
        ],
        interactions: [
            { drug: "Anticoagulants", level: "medium", description: "May alter coagulation parameters" },
            { drug: "Antidiabetic drugs", level: "high", description: "May increase blood glucose levels" },
            { drug: "Diuretics", level: "medium", description: "May cause hypokalemia" }
        ],
        safety: "Taper gradually after prolonged therapy. Monitor blood glucose, blood pressure, and electrolytes. Use lowest effective dose for shortest duration."
    },
    "Dexamethasone": {
        class: "Corticosteroid",
        brandNames: "Decadron, DexPak, Baycadron",
        administration: "Oral, Intravenous, Intramuscular",
        halfLife: "36-54 hours",
        uses: "Used for inflammatory conditions, allergic reactions, cerebral edema, and as antiemetic in chemotherapy. Also used in COVID-19 treatment for severe cases.",
        dosage: "Dosage varies widely: 0.5-10 mg daily depending on condition. For cerebral edema: higher doses may be used.",
        sideEffects: [
            "Insomnia",
            "Increased appetite",
            "Weight gain",
            "Mood changes",
            "Hyperglycemia",
            "Increased risk of infection",
            "Adrenal suppression"
        ],
        interactions: [
            { drug: "Anticoagulants", level: "medium", description: "May alter anticoagulant effect" },
            { drug: "Antidiabetic medications", level: "high", description: "May increase blood glucose levels" },
            { drug: "NSAIDs", level: "high", description: "Increased risk of GI bleeding" }
        ],
        safety: "Long-term use requires gradual tapering. Monitor for Cushing's syndrome with prolonged use. Increased risk of infections and osteoporosis."
    },
    "Hydrocortisone": {
        class: "Corticosteroid",
        brandNames: "Cortef, Solu-Cortef, Hydrocortone",
        administration: "Oral, Topical, Intravenous",
        halfLife: "1.5-2 hours",
        uses: "Used for adrenal insufficiency, inflammatory conditions, allergic reactions, and as replacement therapy in Addison's disease.",
        dosage: "Replacement therapy: 15-25 mg daily in divided doses. For inflammation: higher doses as needed.",
        sideEffects: [
            "Fluid retention",
            "Weight gain",
            "High blood pressure",
            "Mood changes",
            "Increased blood sugar",
            "Skin thinning with topical use"
        ],
        interactions: [
            { drug: "Diuretics", level: "medium", description: "May cause hypokalemia" },
            { drug: "Anticoagulants", level: "medium", description: "May alter coagulation" },
            { drug: "NSAIDs", level: "high", description: "Increased GI bleeding risk" }
        ],
        safety: "Do not stop abruptly if used for adrenal insufficiency. Monitor for signs of infection. Use with caution in patients with diabetes."
    },
    "Diclofenac": {
        class: "NSAID",
        brandNames: "Voltaren, Cataflam, Cambia",
        administration: "Oral, Topical",
        halfLife: "2 hours",
        uses: "Used for pain and inflammation in conditions like osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, and acute migraine.",
        dosage: "Oral: 50 mg two or three times daily. Topical: Apply to affected area 4 times daily. Maximum oral dose 150 mg/day.",
        sideEffects: [
            "Stomach pain or ulcers",
            "Nausea",
            "Diarrhea",
            "Headache",
            "Dizziness",
            "Liver enzyme elevation",
            "Increased cardiovascular risk"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" }
        ],
        safety: "Black box warning for cardiovascular and GI risks. Monitor liver function tests. Use with caution in elderly patients."
    },
    "Indomethacin": {
        class: "NSAID",
        brandNames: "Indocin, Tivorbex",
        administration: "Oral, Rectal",
        halfLife: "4.5-6 hours",
        uses: "Used for moderate to severe arthritis, gout, bursitis, tendonitis, and to close patent ductus arteriosus in premature infants.",
        dosage: "For arthritis: 25-50 mg two or three times daily. Maximum 200 mg/day. For acute gout: 50 mg three times daily.",
        sideEffects: [
            "Headache (common)",
            "Dizziness",
            "Stomach upset or pain",
            "Nausea",
            "Diarrhea",
            "Fluid retention",
            "Increased bleeding risk"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" }
        ],
        safety: "Higher incidence of CNS side effects than other NSAIDs. Use with caution in elderly patients. Monitor for GI bleeding."
    },
    "Celecoxib": {
        class: "COX-2 Selective NSAID",
        brandNames: "Celebrex",
        administration: "Oral",
        halfLife: "11 hours",
        uses: "Used for osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, acute pain, and menstrual cramps.",
        dosage: "For osteoarthritis: 200 mg daily or 100 mg twice daily. For rheumatoid arthritis: 100-200 mg twice daily. Maximum 400 mg/day.",
        sideEffects: [
            "Headache",
            "Dyspepsia",
            "Diarrhea",
            "Abdominal pain",
            "Peripheral edema",
            "Increased cardiovascular risk"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Fluconazole", level: "high", description: "Increased celecoxib levels" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" }
        ],
        safety: "Black box warning for cardiovascular and GI risks. Contraindicated in sulfa allergy. Use lowest effective dose for shortest duration."
    },
    "Etoricoxib": {
        class: "COX-2 Selective NSAID",
        brandNames: "Arcoxia",
        administration: "Oral",
        halfLife: "22 hours",
        uses: "Used for osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, acute gouty arthritis, and chronic musculoskeletal pain.",
        dosage: "For osteoarthritis: 30-60 mg once daily. For rheumatoid arthritis: 90 mg once daily. For acute gout: 120 mg once daily for up to 8 days.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Hypertension",
            "Edema",
            "Dyspepsia",
            "Increased cardiovascular risk"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" }
        ],
        safety: "Increased risk of cardiovascular events. Not approved in the United States. Use with caution in patients with hypertension or heart failure."
    },
    "Meloxicam": {
        class: "NSAID",
        brandNames: "Mobic, Vivlodex",
        administration: "Oral",
        halfLife: "15-20 hours",
        uses: "Used for osteoarthritis and rheumatoid arthritis. Has preferential COX-2 inhibition.",
        dosage: "For osteoarthritis: 7.5 mg once daily. May increase to 15 mg once daily. For rheumatoid arthritis: 15 mg once daily.",
        sideEffects: [
            "Abdominal pain",
            "Diarrhea",
            "Nausea",
            "Headache",
            "Edema",
            "Increased bleeding risk",
            "Dizziness"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "high", description: "Increased lithium levels" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" }
        ],
        safety: "Increased cardiovascular and GI risks. Use lowest effective dose. Monitor for signs of GI bleeding, especially in elderly patients."
    },
    "Sulfasalazine": {
        class: "DMARD (Disease-Modifying Antirheumatic Drug)",
        brandNames: "Azulfidine, Salazopyrin",
        administration: "Oral",
        halfLife: "5-10 hours",
        uses: "Used for rheumatoid arthritis, juvenile idiopathic arthritis, ulcerative colitis, and Crohn's disease.",
        dosage: "For rheumatoid arthritis: Start with 500 mg daily, increase to 2-3 g daily in divided doses. For ulcerative colitis: 3-4 g daily in divided doses.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Loss of appetite",
            "Stomach upset",
            "Orange-yellow discoloration of urine and skin",
            "Rash",
            "Reversible oligospermia in males"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May reduce digoxin absorption" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Methotrexate", level: "medium", description: "Increased risk of bone marrow suppression" }
        ],
        safety: "Monitor CBC and liver function tests regularly. May cause serious blood disorders. Contraindicated in sulfa allergy."
    },
    "Colchicine": {
        class: "Anti-gout Agent",
        brandNames: "Colcrys, Mitigare",
        administration: "Oral",
        halfLife: "27-31 hours",
        uses: "Used for treatment and prevention of gout flares, and for familial Mediterranean fever.",
        dosage: "For acute gout: 1.2 mg initially, then 0.6 mg one hour later. For prophylaxis: 0.6 mg once or twice daily.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Abdominal pain",
            "Muscle weakness",
            "Peripheral neuritis"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increased risk of colchicine toxicity" },
            { drug: "P-glycoprotein inhibitors", level: "high", description: "Increased colchicine levels" },
            { drug: "Statins", level: "medium", description: "Increased risk of myopathy" }
        ],
        safety: "Narrow therapeutic index. Risk of fatal overdose. Reduce dose in renal impairment. Monitor for signs of toxicity."
    },
    "Mesalamine": {
        class: "5-aminosalicylate",
        brandNames: "Asacol, Lialda, Pentasa, Rowasa",
        administration: "Oral, Rectal",
        halfLife: "5-7 hours",
        uses: "Used for treatment of ulcerative colitis and maintenance of remission.",
        dosage: "Oral: 2.4-4.8 g daily in divided doses. Rectal: 1-4 g daily depending on formulation.",
        sideEffects: [
            "Headache",
            "Nausea",
            "Diarrhea",
            "Abdominal pain",
            "Rash",
            "Hair loss"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Azathioprine", level: "medium", description: "Increased risk of blood disorders" }
        ],
        safety: "May cause renal impairment. Monitor renal function during treatment. Rare risk of acute intolerance syndrome."
    },
    "Azathioprine": {
        class: "Immunosuppressant",
        brandNames: "Imuran, Azasan",
        administration: "Oral, Intravenous",
        halfLife: "5 hours",
        uses: "Used for rheumatoid arthritis, prevention of organ transplant rejection, and autoimmune diseases like lupus and inflammatory bowel disease.",
        dosage: "For rheumatoid arthritis: 1 mg/kg/day initially, increase to 2.5 mg/kg/day. For transplant: 3-5 mg/kg/day.",
        sideEffects: [
            "Nausea and vomiting",
            "Leukopenia",
            "Thrombocytopenia",
            "Increased infection risk",
            "Hepatotoxicity",
            "Pancreatitis",
            "Increased cancer risk"
        ],
        interactions: [
            { drug: "Allopurinol", level: "high", description: "Increased azathioprine toxicity" },
            { drug: "Warfarin", level: "medium", description: "May reduce anticoagulant effect" },
            { drug: "ACE inhibitors", level: "medium", description: "Increased risk of anemia" }
        ],
        safety: "Black box warning for malignancy and infection risk. Requires regular blood count monitoring. Reduce dose with allopurinol coadministration."
    },
    "Methotrexate": {
        class: "DMARD, Antimetabolite",
        brandNames: "Trexall, Rheumatrex",
        administration: "Oral, Subcutaneous, Intramuscular",
        halfLife: "3-10 hours (low dose), 8-15 hours (high dose)",
        uses: "Used for rheumatoid arthritis, psoriasis, and various cancers. Also used for medical abortion in combination with misoprostol.",
        dosage: "For rheumatoid arthritis: 7.5-25 mg once weekly. For psoriasis: 10-25 mg once weekly. Always weekly dosing for autoimmune conditions.",
        sideEffects: [
            "Nausea",
            "Mouth sores",
            "Hair loss",
            "Liver toxicity",
            "Bone marrow suppression",
            "Pulmonary toxicity",
            "Increased infection risk"
        ],
        interactions: [
            { drug: "NSAIDs", level: "high", description: "Increased methotrexate toxicity" },
            { drug: "Probenecid", level: "high", description: "Increased methotrexate levels" },
            { drug: "Trimethoprim-sulfa", level: "high", description: "Increased bone marrow toxicity" }
        ],
        safety: "Black box warning for hepatotoxicity and bone marrow suppression. Requires folic acid supplementation. Absolute contraindication in pregnancy."
    },
    "Cortisone": {
        class: "Corticosteroid",
        brandNames: "Cortone",
        administration: "Oral",
        halfLife: "0.5-2 hours",
        uses: "Used for adrenal insufficiency, inflammatory conditions, and allergic disorders. Requires hepatic conversion to hydrocortisone for activity.",
        dosage: "For replacement therapy: 25-35 mg daily in divided doses. For inflammation: higher doses as needed.",
        sideEffects: [
            "Fluid retention",
            "Weight gain",
            "High blood pressure",
            "Mood changes",
            "Increased blood sugar",
            "Increased infection risk"
        ],
        interactions: [
            { drug: "Diuretics", level: "medium", description: "May cause hypokalemia" },
            { drug: "Anticoagulants", level: "medium", description: "May alter coagulation" },
            { drug: "NSAIDs", level: "high", description: "Increased GI bleeding risk" }
        ],
        safety: "Do not stop abruptly. Taper gradually. Monitor for signs of infection and adrenal insufficiency. Use with caution in diabetes."
    },
    "Leflunomide": {
        class: "DMARD",
        brandNames: "Arava",
        administration: "Oral",
        halfLife: "14-18 days",
        uses: "Used for rheumatoid arthritis and psoriatic arthritis. Has both anti-inflammatory and immunomodulatory effects.",
        dosage: "Loading dose: 100 mg daily for 3 days. Maintenance: 10-20 mg daily.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Headache",
            "Rash",
            "Hair loss",
            "Elevated liver enzymes",
            "Hypertension"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase INR" },
            { drug: "Rifampin", level: "medium", description: "Increased leflunomide levels" },
            { drug: "Live vaccines", level: "high", description: "Contraindicated" }
        ],
        safety: "Teratogenic - requires reliable contraception. Monitor liver enzymes regularly. Washout procedure needed for drug elimination."
    },
    "Hydroxychloroquine": {
        class: "Antimalarial, DMARD",
        brandNames: "Plaquenil",
        administration: "Oral",
        halfLife: "40-50 days",
        uses: "Used for rheumatoid arthritis, systemic lupus erythematosus, and malaria prophylaxis and treatment.",
        dosage: "For rheumatoid arthritis: 400-600 mg daily initially, then 200-400 mg daily. For lupus: 200-400 mg daily.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Headache",
            "Rash",
            "Retinal toxicity",
            "QT prolongation"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of arrhythmia" },
            { drug: "Insulin", level: "medium", description: "May enhance hypoglycemic effect" }
        ],
        safety: "Risk of irreversible retinal damage. Requires regular ophthalmologic exams. Use with caution in patients with cardiac disease."
    },
    "Etanercept": {
        class: "TNF inhibitor, Biologic DMARD",
        brandNames: "Enbrel",
        administration: "Subcutaneous",
        halfLife: "70-132 hours",
        uses: "Used for rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, plaque psoriasis, and juvenile idiopathic arthritis.",
        dosage: "50 mg once weekly or 25 mg twice weekly. For pediatric use: 0.8 mg/kg weekly.",
        sideEffects: [
            "Injection site reactions",
            "Upper respiratory infections",
            "Headache",
            "Increased infection risk",
            "Reactivation of tuberculosis",
            "Heart failure exacerbation"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Contraindicated" },
            { drug: "Anakinra", level: "high", description: "Increased infection risk" },
            { drug: "Abatacept", level: "high", description: "Increased infection risk" }
        ],
        safety: "Black box warning for serious infections and malignancy. Screen for TB before initiation. Monitor for signs of infection during treatment."
    },
    "Adalimumab": {
        class: "TNF inhibitor, Biologic DMARD",
        brandNames: "Humira",
        administration: "Subcutaneous",
        halfLife: "10-20 days",
        uses: "Used for rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, Crohn's disease, ulcerative colitis, and plaque psoriasis.",
        dosage: "For rheumatoid arthritis: 40 mg every other week. Some patients may require 40 mg weekly.",
        sideEffects: [
            "Injection site reactions",
            "Upper respiratory infections",
            "Headache",
            "Rash",
            "Increased infection risk",
            "Reactivated tuberculosis"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Contraindicated" },
            { drug: "Anakinra", level: "high", description: "Increased infection risk" },
            { drug: "Abatacept", level: "high", description: "Increased infection risk" }
        ],
        safety: "Black box warning for serious infections and malignancy. TB screening required. Monitor for signs of infection and heart failure."
    },
    "Infliximab": {
        class: "TNF inhibitor, Biologic DMARD",
        brandNames: "Remicade, Inflectra, Renflexis",
        administration: "Intravenous",
        halfLife: "7-12 days",
        uses: "Used for rheumatoid arthritis, Crohn's disease, ulcerative colitis, ankylosing spondylitis, psoriatic arthritis, and plaque psoriasis.",
        dosage: "For rheumatoid arthritis: 3 mg/kg at 0, 2, 6 weeks, then every 8 weeks. May increase to 10 mg/kg.",
        sideEffects: [
            "Infusion reactions",
            "Headache",
            "Fever",
            "Increased infection risk",
            "Reactivated tuberculosis",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Contraindicated" },
            { drug: "Anakinra", level: "high", description: "Increased infection risk" },
            { drug: "Abatacept", level: "high", description: "Increased infection risk" }
        ],
        safety: "Black box warning for serious infections and malignancy. Pre-medicate for infusion reactions. Screen for TB and hepatitis B."
    },
    "Golimumab": {
        class: "TNF inhibitor, Biologic DMARD",
        brandNames: "Simponi, Simponi Aria",
        administration: "Subcutaneous, Intravenous",
        halfLife: "9-15 days",
        uses: "Used for rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, and ulcerative colitis.",
        dosage: "Subcutaneous: 50 mg monthly. IV: 2 mg/kg at 0, 4 weeks, then every 8 weeks.",
        sideEffects: [
            "Upper respiratory infections",
            "Injection site reactions",
            "Headache",
            "Increased infection risk",
            "Reactivated tuberculosis",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Contraindicated" },
            { drug: "Anakinra", level: "high", description: "Increased infection risk" },
            { drug: "Abatacept", level: "high", description: "Increased infection risk" }
        ],
        safety: "Black box warning for serious infections and malignancy. Screen for TB before initiation. Monitor for signs of infection."
    },
    "Certolizumab": {
        class: "TNF inhibitor, Biologic DMARD",
        brandNames: "Cimzia",
        administration: "Subcutaneous",
        halfLife: "14 days",
        uses: "Used for Crohn's disease, rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, and plaque psoriasis.",
        dosage: "Loading dose: 400 mg at 0, 2, 4 weeks. Maintenance: 200 mg every other week or 400 mg every 4 weeks.",
        sideEffects: [
            "Upper respiratory infections",
            "Urinary tract infections",
            "Headache",
            "Increased infection risk",
            "Reactivated tuberculosis",
            "Hypertension"
        ],
        interactions: [
            { drug: "Live vaccines", level: "high", description: "Contraindicated" },
            { drug: "Anakinra", level: "high", description: "Increased infection risk" },
            { drug: "Abatacept", level: "high", description: "Increased infection risk" }
        ],
        safety: "Black box warning for serious infections and malignancy. TB screening required. May be used during pregnancy (PEGylated, minimal placental transfer)."
    },
    "Tofacitinib": {
        class: "JAK inhibitor",
        brandNames: "Xeljanz",
        administration: "Oral",
        halfLife: "3 hours",
        uses: "Used for rheumatoid arthritis, psoriatic arthritis, ulcerative colitis, and ankylosing spondylitis.",
        dosage: "5 mg twice daily or 11 mg once daily. Higher doses for ulcerative colitis.",
        sideEffects: [
            "Upper respiratory infections",
            "Headache",
            "Diarrhea",
            "Increased cholesterol",
            "Increased infection risk",
            "Thrombosis risk"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increased tofacitinib levels" },
            { drug: "Immunosuppressants", level: "high", description: "Increased infection risk" },
            { drug: "Live vaccines", level: "high", description: "Contraindicated" }
        ],
        safety: "Black box warning for serious infections, malignancy, and thrombosis. Monitor for infections, lipids, and liver enzymes."
    },
    "Baricitinib": {
        class: "JAK inhibitor",
        brandNames: "Olumiant",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Used for rheumatoid arthritis and alopecia areata. Also used for COVID-19 in hospitalized patients.",
        dosage: "For rheumatoid arthritis: 2 mg once daily. For COVID-19: 4 mg once daily for 14 days or until discharge.",
        sideEffects: [
            "Upper respiratory infections",
            "Nausea",
            "Herpes zoster reactivation",
            "Increased cholesterol",
            "Increased infection risk",
            "Thrombosis risk"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "medium", description: "May increase baricitinib levels" },
            { drug: "Immunosuppressants", level: "high", description: "Increased infection risk" },
            { drug: "Live vaccines", level: "high", description: "Contraindicated" }
        ],
        safety: "Black box warning for serious infections, malignancy, and thrombosis. Screen for viral hepatitis and TB. Monitor lipids and liver enzymes."
    },
    "Levothyroxine": {
        class: "Thyroid Hormone",
        brandNames: "Synthroid, Levoxyl, Tirosint, Unithroid",
        administration: "Oral",
        halfLife: "6-7 days",
        uses: "Levothyroxine is used to treat hypothyroidism (underactive thyroid). It is also used to treat or prevent goiter (enlarged thyroid gland) and to manage thyroid cancer.",
        dosage: "Initial dose: 25-50 mcg once daily. Adjust dose by 12.5-25 mcg increments every 4-6 weeks based on TSH levels. Maintenance: 1.6 mcg/kg/day. Take on empty stomach, 30-60 minutes before breakfast.",
        sideEffects: [
            "Headache",
            "Nervousness or irritability",
            "Insomnia",
            "Increased appetite",
            "Weight loss",
            "Heat intolerance",
            "Excessive sweating"
        ],
        interactions: [
            { drug: "Calcium supplements", level: "high", description: "May decrease absorption - separate by at least 4 hours" },
            { drug: "Iron supplements", level: "high", description: "May decrease absorption - separate by at least 4 hours" },
            { drug: "Proton pump inhibitors", level: "medium", description: "May decrease absorption" },
            { drug: "Warfarin", level: "high", description: "May increase anticoagulant effect" }
        ],
        safety: "Do not use for weight loss in patients with normal thyroid function. Overtreatment may cause osteoporosis and cardiac complications. Regular monitoring of TSH levels required."
    },

    "Liothyronine": {
        class: "Thyroid Hormone (T3)",
        brandNames: "Cytomel, Triostat",
        administration: "Oral, IV",
        halfLife: "2.5 days",
        uses: "Liothyronine is used to treat hypothyroidism. It may be used when rapid onset of effect is desired or in patients who cannot convert T4 to T3.",
        dosage: "Initial: 25 mcg daily. Increase by 12.5-25 mcg every 1-2 weeks. Maintenance: 25-75 mcg daily in divided doses.",
        sideEffects: [
            "Palpitations",
            "Tachycardia",
            "Angina pectoris",
            "Cardiac arrhythmias",
            "Headache",
            "Nervousness",
            "Insomnia"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "May increase anticoagulant effect" },
            { drug: "Antidiabetic agents", level: "medium", description: "May alter glucose control" },
            { drug: "Cholestyramine", level: "medium", description: "Decreases absorption" }
        ],
        safety: "More potent and faster acting than levothyroxine. Higher risk of cardiac effects. Not recommended for long-term replacement therapy as monotherapy."
    },

    "Methimazole": {
        class: "Antithyroid Agent",
        brandNames: "Tapazole",
        administration: "Oral",
        halfLife: "5-6 hours",
        uses: "Methimazole is used to treat hyperthyroidism (overactive thyroid) and to prepare patients for thyroid surgery or radioactive iodine treatment.",
        dosage: "Initial: 15-60 mg daily in divided doses. Maintenance: 5-15 mg daily. May be given as single daily dose once euthyroid.",
        sideEffects: [
            "Rash",
            "Urticaria",
            "Arthralgia",
            "Fever",
            "Nausea",
            "Vomiting",
            "Loss of taste",
            "Hair loss"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May decrease anticoagulant effect" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "Theophylline", level: "medium", description: "May decrease theophylline clearance" }
        ],
        safety: "Risk of agranulocytosis - monitor for fever, sore throat. Hepatotoxicity may occur. Avoid in pregnancy, especially first trimester."
    },

    "Propylthiouracil": {
        class: "Antithyroid Agent",
        brandNames: "PTU",
        administration: "Oral",
        halfLife: "1-2 hours",
        uses: "Propylthiouracil is used to treat hyperthyroidism. It may be preferred in thyroid storm and during first trimester of pregnancy.",
        dosage: "Initial: 300-400 mg daily in divided doses every 8 hours. Maintenance: 100-150 mg daily.",
        sideEffects: [
            "Rash",
            "Urticaria",
            "Arthralgia",
            "Nausea",
            "Vomiting",
            "Loss of taste",
            "Hepatotoxicity"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May decrease anticoagulant effect" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" }
        ],
        safety: "Black box warning for severe liver injury and acute liver failure. Reserved for patients who cannot tolerate methimazole or in first trimester pregnancy."
    },

    "Carbimazole": {
        class: "Antithyroid Agent",
        brandNames: "Neo-Mercazole",
        administration: "Oral",
        halfLife: "6-13 hours",
        uses: "Carbimazole is used to treat hyperthyroidism. It is converted to methimazole in the body and is commonly used outside the United States.",
        dosage: "Initial: 15-40 mg daily. Maintenance: 5-15 mg daily. May be given as single daily dose.",
        sideEffects: [
            "Rash",
            "Pruritus",
            "Nausea",
            "Headache",
            "Arthralgia",
            "Alopecia",
            "Taste disturbance"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May decrease anticoagulant effect" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" }
        ],
        safety: "Risk of agranulocytosis. Cross-hypersensitivity with methimazole. Monitor liver function and complete blood count regularly."
    },

    "Thyroid desiccated": {
        class: "Thyroid Hormone (Natural)",
        brandNames: "Armour Thyroid, Nature-Throid, WP Thyroid",
        administration: "Oral",
        halfLife: "Not well defined",
        uses: "Desiccated thyroid is used to treat hypothyroidism. It contains both T4 and T3 hormones derived from porcine thyroid glands.",
        dosage: "Initial: 15-30 mg daily. Increase by 15 mg every 2-4 weeks. Maintenance: 60-120 mg daily.",
        sideEffects: [
            "Palpitations",
            "Tachycardia",
            "Cardiac arrhythmias",
            "Headache",
            "Nervousness",
            "Irritability",
            "Insomnia"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "May increase anticoagulant effect" },
            { drug: "Cholestyramine", level: "medium", description: "Decreases absorption" },
            { drug: "Calcium carbonate", level: "medium", description: "Decreases absorption" }
        ],
        safety: "Variable hormone content between batches. Not recommended as first-line therapy. Regular monitoring of TSH, T4, and T3 levels required."
    },

    "Potassium iodide": {
        class: "Antithyroid Agent / Expectorant",
        brandNames: "SSKI, ThyroSafe, iOSAT",
        administration: "Oral",
        halfLife: "Not applicable",
        uses: "Potassium iodide is used to protect the thyroid gland from radioactive iodine in radiation emergencies. Also used for thyroid storm and as an expectorant.",
        dosage: "Radiation emergency: 130 mg daily. Thyroid storm: 250 mg every 6 hours. Expectorant: 300-600 mg 3-4 times daily.",
        sideEffects: [
            "Metallic taste",
            "Burning mouth/throat",
            "Sore teeth/gums",
            "Headache",
            "Rash",
            "Nausea",
            "Diarrhea",
            "Stomach pain"
        ],
        interactions: [
            { drug: "Lithium", level: "medium", description: "Enhanced hypothyroid effect" },
            { drug: "ACE inhibitors", level: "medium", description: "Increased risk of hyperkalemia" },
            { drug: "Potassium-sparing diuretics", level: "medium", description: "Increased risk of hyperkalemia" }
        ],
        safety: "Should only be used for radiation emergencies when instructed by public health officials. Contraindicated in known iodine sensitivity."
    },

    "Metformin": {
        class: "Biguanide",
        brandNames: "Glucophage, Fortamet, Glumetza, Riomet",
        administration: "Oral",
        halfLife: "6.2 hours",
        uses: "Metformin is used as first-line treatment for type 2 diabetes. It improves glycemic control by decreasing hepatic glucose production and increasing insulin sensitivity.",
        dosage: "Initial: 500 mg twice daily or 850 mg once daily. Maximum: 2550 mg/day. Extended-release: 500-2000 mg once daily.",
        sideEffects: [
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Flatulence",
            "Indigestion",
            "Abdominal discomfort",
            "Metallic taste"
        ],
        interactions: [
            { drug: "Iodinated contrast media", level: "high", description: "Risk of lactic acidosis - temporary discontinuation required" },
            { drug: "Alcohol", level: "high", description: "Increased risk of lactic acidosis" },
            { drug: "Cimetidine", level: "medium", description: "Increases metformin concentration" }
        ],
        safety: "Risk of lactic acidosis, especially in renal impairment. Contraindicated in patients with eGFR <30 mL/min. Vitamin B12 deficiency may occur with long-term use."
    },

    "Glimepiride": {
        class: "Sulfonylurea (Second Generation)",
        brandNames: "Amaryl",
        administration: "Oral",
        halfLife: "5-9 hours",
        uses: "Glimepiride is used to improve glycemic control in type 2 diabetes mellitus as an adjunct to diet and exercise.",
        dosage: "Initial: 1-2 mg once daily. Maximum: 8 mg once daily. Take with breakfast or first main meal.",
        sideEffects: [
            "Hypoglycemia",
            "Dizziness",
            "Headache",
            "Nausea",
            "Weight gain",
            "Allergic skin reactions"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "medium", description: "May mask hypoglycemia symptoms" },
            { drug: "Fluconazole", level: "medium", description: "Increases sulfonylurea levels" },
            { drug: "Warfarin", level: "medium", description: "May increase or decrease anticoagulant effect" }
        ],
        safety: "Risk of severe hypoglycemia, especially in elderly, debilitated, or malnourished patients. May cause weight gain."
    },

    "Gliclazide": {
        class: "Sulfonylurea (Second Generation)",
        brandNames: "Diamicron, Diamicron MR",
        administration: "Oral",
        halfLife: "10-12 hours",
        uses: "Gliclazide is used to treat type 2 diabetes. It stimulates insulin secretion from pancreatic beta cells and may have additional beneficial effects on microcirculation.",
        dosage: "Immediate-release: 40-80 mg daily, maximum 320 mg. Modified-release: 30-120 mg once daily.",
        sideEffects: [
            "Hypoglycemia",
            "Gastrointestinal disturbances",
            "Headache",
            "Dizziness",
            "Skin reactions",
            "Weight gain"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "medium", description: "May mask hypoglycemia symptoms" },
            { drug: "MAO inhibitors", level: "medium", description: "May enhance hypoglycemic effect" },
            { drug: "Thiazide diuretics", level: "medium", description: "May reduce hypoglycemic effect" }
        ],
        safety: "Lower risk of hypoglycemia compared to other sulfonylureas. Modified-release formulation provides more stable glycemic control."
    },

    "Glyburide": {
        class: "Sulfonylurea (Second Generation)",
        brandNames: "Diabeta, Glynase, Micronase",
        administration: "Oral",
        halfLife: "10 hours",
        uses: "Glyburide is used to improve glycemic control in type 2 diabetes mellitus through stimulation of insulin secretion.",
        dosage: "Initial: 2.5-5 mg daily. Maximum: 20 mg daily. Micronized: 1.5-3 mg daily, maximum 12 mg.",
        sideEffects: [
            "Hypoglycemia",
            "Nausea",
            "Heartburn",
            "Weight gain",
            "Allergic skin reactions",
            "Hepatic porphyria"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May mask hypoglycemia symptoms" },
            { drug: "Fluconazole", level: "high", description: "Significantly increases glyburide levels" },
            { drug: "Warfarin", level: "medium", description: "May increase or decrease anticoagulant effect" }
        ],
        safety: "Higher risk of hypoglycemia compared to other sulfonylureas. Contraindicated in patients with G6PD deficiency due to risk of hemolytic anemia."
    },

    "Pioglitazone": {
        class: "Thiazolidinedione",
        brandNames: "Actos",
        administration: "Oral",
        halfLife: "16-24 hours",
        uses: "Pioglitazone is used to improve glycemic control in type 2 diabetes by increasing insulin sensitivity in peripheral tissues.",
        dosage: "Initial: 15-30 mg once daily. Maximum: 45 mg once daily.",
        sideEffects: [
            "Weight gain",
            "Edema",
            "Heart failure",
            "Fractures in women",
            "Macular edema",
            "Upper respiratory infection"
        ],
        interactions: [
            { drug: "Gemfibrozil", level: "high", description: "Increases pioglitazone levels" },
            { drug: "Rifampin", level: "medium", description: "Decreases pioglitazone levels" },
            { drug: "Atorvastatin", level: "low", description: "May decrease atorvastatin levels" }
        ],
        safety: "Black box warning for heart failure. Contraindicated in patients with NYHA Class III or IV heart failure. Monitor liver enzymes periodically."
    },

    "Sitagliptin": {
        class: "DPP-4 Inhibitor",
        brandNames: "Januvia",
        administration: "Oral",
        halfLife: "12.4 hours",
        uses: "Sitagliptin is used to improve glycemic control in type 2 diabetes by increasing incretin levels, which stimulate insulin release and reduce glucagon secretion.",
        dosage: "100 mg once daily. Renal impairment: adjust based on eGFR.",
        sideEffects: [
            "Headache",
            "Nasopharyngitis",
            "Upper respiratory infection",
            "Nausea",
            "Diarrhea",
            "Arthralgia"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "Sulfonylureas", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Risk of pancreatitis. Monitor for signs of pancreatitis. Severe joint pain may occur. Dose adjustment required in renal impairment."
    },

    "Saxagliptin": {
        class: "DPP-4 Inhibitor",
        brandNames: "Onglyza",
        administration: "Oral",
        halfLife: "2.5 hours",
        uses: "Saxagliptin is used to improve glycemic control in type 2 diabetes by inhibiting DPP-4 enzyme, increasing incretin levels.",
        dosage: "2.5 or 5 mg once daily. Use 2.5 mg dose with strong CYP3A4/5 inhibitors.",
        sideEffects: [
            "Upper respiratory infection",
            "Urinary tract infection",
            "Headache",
            "Peripheral edema",
            "Rash"
        ],
        interactions: [
            { drug: "Strong CYP3A4 inhibitors", level: "high", description: "Increase saxagliptin exposure" },
            { drug: "Sulfonylureas", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Risk of heart failure. Increased risk of hospitalization for heart failure. Monitor for signs of heart failure. Dose adjustment in renal impairment."
    },

    "Linagliptin": {
        class: "DPP-4 Inhibitor",
        brandNames: "Tradjenta",
        administration: "Oral",
        halfLife: "12 hours",
        uses: "Linagliptin is used to improve glycemic control in type 2 diabetes. It has primarily non-renal excretion.",
        dosage: "5 mg once daily. No dose adjustment needed in renal or hepatic impairment.",
        sideEffects: [
            "Nasopharyngitis",
            "Hyperlipidemia",
            "Hyperuricemia",
            "Arthralgia",
            "Back pain",
            "Headache"
        ],
        interactions: [
            { drug: "Rifampin", level: "medium", description: "Decreases linagliptin exposure" },
            { drug: "Sulfonylureas", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Risk of pancreatitis. Severe joint pain may occur. No dose adjustment required in renal impairment - unique among DPP-4 inhibitors."
    },

    "Empagliflozin": {
        class: "SGLT2 Inhibitor",
        brandNames: "Jardiance",
        administration: "Oral",
        halfLife: "12.4 hours",
        uses: "Empagliflozin is used to improve glycemic control in type 2 diabetes. Also reduces cardiovascular death in patients with established cardiovascular disease.",
        dosage: "10 mg once daily in morning. May increase to 25 mg once daily.",
        sideEffects: [
            "Genital mycotic infections",
            "Urinary tract infections",
            "Increased urination",
            "Thirst",
            "Orthostatic hypotension",
            "Dyslipidemia"
        ],
        interactions: [
            { drug: "Diuretics", level: "medium", description: "Increased risk of volume depletion" },
            { drug: "Insulin", level: "medium", description: "Increased risk of hypoglycemia" },
            { drug: "Lithium", level: "medium", description: "May decrease lithium levels" }
        ],
        safety: "Risk of ketoacidosis, even with normal blood glucose levels. May cause acute kidney injury. Monitor for genital infections and volume depletion."
    },

    "Dapagliflozin": {
        class: "SGLT2 Inhibitor",
        brandNames: "Farxiga",
        administration: "Oral",
        halfLife: "12.9 hours",
        uses: "Dapagliflozin is used to improve glycemic control in type 2 diabetes. Also indicated for heart failure and chronic kidney disease.",
        dosage: "5 mg once daily in morning. May increase to 10 mg once daily.",
        sideEffects: [
            "Genital mycotic infections",
            "Urinary tract infections",
            "Increased urination",
            "Back pain",
            "Nausea",
            "Dyslipidemia"
        ],
        interactions: [
            { drug: "Diuretics", level: "medium", description: "Increased risk of volume depletion" },
            { drug: "Insulin", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Risk of ketoacidosis. May cause acute kidney injury. Fournier's gangrene reported. Monitor renal function and volume status."
    },

    "Insulin glargine": {
        class: "Long-Acting Insulin Analog",
        brandNames: "Lantus, Basaglar, Toujeo",
        administration: "Subcutaneous",
        halfLife: "Not applicable",
        uses: "Insulin glargine provides basal insulin coverage for type 1 and type 2 diabetes. It has a flat, prolonged action profile with no pronounced peak.",
        dosage: "Individualized. Type 2 diabetes: start with 0.2 units/kg or 10 units once daily. Adjust based on fasting glucose.",
        sideEffects: [
            "Hypoglycemia",
            "Weight gain",
            "Injection site reactions",
            "Lipodystrophy",
            "Allergic reactions",
            "Peripheral edema"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May mask hypoglycemia symptoms" },
            { drug: "Thiazolidinediones", level: "medium", description: "Increased risk of edema and heart failure" },
            { drug: "Alcohol", level: "medium", description: "May increase hypoglycemia risk" }
        ],
        safety: "Do not mix with other insulins. Risk of severe hypoglycemia. Rotate injection sites to prevent lipodystrophy."
    },

    "Insulin lispro": {
        class: "Rapid-Acting Insulin Analog",
        brandNames: "Humalog, Admelog, Lyumjev",
        administration: "Subcutaneous",
        halfLife: "1 hour",
        uses: "Insulin lispro is used for prandial (mealtime) coverage in type 1 and type 2 diabetes. Has rapid onset and short duration.",
        dosage: "Individualized. Typically given 0-15 minutes before meals. Dose based on carbohydrate intake and pre-meal glucose.",
        sideEffects: [
            "Hypoglycemia",
            "Weight gain",
            "Injection site reactions",
            "Lipodystrophy",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May mask hypoglycemia symptoms" },
            { drug: "MAO inhibitors", level: "medium", description: "May enhance hypoglycemic effect" },
            { drug: "Thiazide diuretics", level: "medium", description: "May reduce insulin effect" }
        ],
        safety: "Administer immediately before meals (within 15 minutes). Risk of severe hypoglycemia. Do not use during episodes of hypoglycemia."
    },

    "Insulin detemir": {
        class: "Long-Acting Insulin Analog",
        brandNames: "Levemir",
        administration: "Subcutaneous",
        halfLife: "5-7 hours",
        uses: "Insulin detemir provides basal insulin coverage for type 1 and type 2 diabetes. Has a flat, prolonged action profile.",
        dosage: "Type 1: 0.2-0.4 units/kg/day. Type 2: 10 units daily or 0.1-0.2 units/kg/day. May require twice daily dosing.",
        sideEffects: [
            "Hypoglycemia",
            "Weight gain",
            "Injection site reactions",
            "Lipodystrophy",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "Beta-blockers", level: "high", description: "May mask hypoglycemia symptoms" },
            { drug: "Thiazolidinediones", level: "medium", description: "Increased risk of edema and heart failure" },
            { drug: "Corticosteroids", level: "medium", description: "May increase insulin requirements" }
        ],
        safety: "Less weight gain compared to other basal insulins. Risk of severe hypoglycemia. Rotate injection sites."
    },

    "Liraglutide": {
        class: "GLP-1 Receptor Agonist",
        brandNames: "Victoza, Saxenda",
        administration: "Subcutaneous",
        halfLife: "13 hours",
        uses: "Liraglutide improves glycemic control in type 2 diabetes and reduces cardiovascular risk. Saxenda formulation is used for weight management.",
        dosage: "Diabetes: Start 0.6 mg daily for 1 week, then increase to 1.2 mg. Max 1.8 mg daily. Obesity: Titrate to 3 mg daily.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Diarrhea",
            "Constipation",
            "Decreased appetite",
            "Injection site reactions",
            "Headache"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase INR" },
            { drug: "Oral medications", level: "medium", description: "May delay gastric absorption" },
            { drug: "Insulin", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Black box warning for thyroid C-cell tumors in rodents. Contraindicated in personal/family history of medullary thyroid carcinoma or MEN-2."
    },

    "Dulaglutide": {
        class: "GLP-1 Receptor Agonist",
        brandNames: "Trulicity",
        administration: "Subcutaneous",
        halfLife: "5 days",
        uses: "Dulaglutide improves glycemic control in type 2 diabetes and reduces cardiovascular events in patients with established cardiovascular disease.",
        dosage: "0.75 mg once weekly. May increase to 1.5 mg, 3 mg, or 4.5 mg once weekly based on glycemic response.",
        sideEffects: [
            "Nausea",
            "Diarrhea",
            "Vomiting",
            "Abdominal pain",
            "Decreased appetite",
            "Dyspepsia",
            "Fatigue"
        ],
        interactions: [
            { drug: "Oral medications", level: "medium", description: "May delay gastric absorption" },
            { drug: "Insulin", level: "medium", description: "Increased risk of hypoglycemia" }
        ],
        safety: "Black box warning for thyroid C-cell tumors. Risk of pancreatitis. Once-weekly administration. Do not use in patients with severe GI disease."
    },
    "Paracetamol": {
        class: "Analgesic/Antipyretic",
        brandNames: "Tylenol, Panadol, Calpol",
        administration: "Oral, Rectal, IV",
        halfLife: "1-4 hours",
        uses: "Paracetamol is used to treat mild to moderate pain and fever. It is commonly used for headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.",
        dosage: "Adults: 500-1000 mg every 4-6 hours as needed. Maximum 4000 mg per day. Children: 10-15 mg/kg every 4-6 hours.",
        sideEffects: [
            "Nausea",
            "Stomach pain",
            "Loss of appetite",
            "Headache",
            "Dark urine",
            "Jaundice (yellowing of skin or eyes)"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase risk of bleeding" },
            { drug: "Alcohol", level: "high", description: "Increased risk of liver damage" },
            { drug: "Chloramphenicol", level: "medium", description: "Increased toxicity risk" }
        ],
        safety: "Do not exceed recommended dosage. Overdose can cause severe liver damage. Avoid alcohol during treatment. Not for use in severe liver disease."
    },

    "Ibuprofen": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Advil, Motrin, Nurofen",
        administration: "Oral, Topical",
        halfLife: "2-4 hours",
        uses: "Ibuprofen is used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.",
        dosage: "Adults: 200-400 mg every 4-6 hours. Maximum 1200 mg per day. For arthritis: up to 800 mg three times daily.",
        sideEffects: [
            "Upset stomach",
            "Heartburn",
            "Dizziness",
            "Headache",
            "Rash",
            "Fluid retention"
        ],
        interactions: [
            { drug: "Aspirin", level: "medium", description: "May reduce cardioprotective effects" },
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "medium", description: "May increase lithium levels" }
        ],
        safety: "Increased risk of serious cardiovascular and gastrointestinal events. Not recommended during last trimester of pregnancy. Use with caution in elderly patients."
    },

    "Naproxen": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Aleve, Naprosyn, Anaprox",
        administration: "Oral",
        halfLife: "12-17 hours",
        uses: "Naproxen is used to treat pain or inflammation caused by conditions such as arthritis, ankylosing spondylitis, tendinitis, bursitis, gout, or menstrual cramps.",
        dosage: "Adults: 250-500 mg twice daily. Maximum 1250 mg per day. Delayed-release: 375-500 mg twice daily.",
        sideEffects: [
            "Heartburn",
            "Stomach pain",
            "Drowsiness",
            "Headache",
            "Ringing in ears",
            "Vision changes"
        ],
        interactions: [
            { drug: "SSRIs", level: "high", description: "Increased risk of gastrointestinal bleeding" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" },
            { drug: "Methotrexate", level: "high", description: "Increased methotrexate toxicity" }
        ],
        safety: "Increased risk of heart attack or stroke. Contraindicated in patients with aspirin-sensitive asthma. Monitor renal function with long-term use."
    },

    "Diclofenac": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Voltaren, Cataflam, Cambia",
        administration: "Oral, Topical, Ophthalmic",
        halfLife: "2 hours",
        uses: "Diclofenac is used to treat pain and inflammatory conditions including rheumatoid arthritis, osteoarthritis, ankylosing spondylitis, and menstrual cramps.",
        dosage: "Oral: 50 mg two or three times daily. Extended-release: 100 mg once daily. Topical: Apply 4 times daily to affected area.",
        sideEffects: [
            "Stomach upset",
            "Diarrhea",
            "Headache",
            "Dizziness",
            "Fluid retention",
            "Elevated liver enzymes"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Cyclosporine", level: "high", description: "Increased nephrotoxicity risk" },
            { drug: "Digoxin", level: "medium", description: "Increased digoxin levels" }
        ],
        safety: "Increased cardiovascular thrombotic events. Severe skin reactions possible. Use lowest effective dose for shortest duration. Monitor liver function."
    },

    "Ketorolac": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Toradol, Acular",
        administration: "Oral, IV, IM, Ophthalmic",
        halfLife: "5-6 hours",
        uses: "Ketorolac is used for short-term management of moderately severe acute pain that requires analgesia at the opioid level. Not for minor or chronic pain.",
        dosage: "IV/IM: 30 mg single dose or 15-30 mg every 6 hours. Oral: 10 mg every 4-6 hours. Maximum 5 days total use.",
        sideEffects: [
            "Gastrointestinal bleeding",
            "Headache",
            "Drowsiness",
            "Injection site pain",
            "Edema",
            "Hypertension"
        ],
        interactions: [
            { drug: "Probenecid", level: "high", description: "Increased ketorolac levels" },
            { drug: "Pentoxifylline", level: "high", description: "Increased bleeding risk" },
            { drug: "Aspirin", level: "medium", description: "Increased adverse effects" }
        ],
        safety: "For short-term use only (max 5 days). High risk of gastrointestinal bleeding and renal impairment. Contraindicated in advanced renal disease."
    },

    "Aspirin": {
        class: "Salicylate, NSAID",
        brandNames: "Bayer, Ecotrin, Bufferin",
        administration: "Oral, Rectal",
        halfLife: "Dose-dependent: 2-3 hours (low dose), 15-30 hours (high dose)",
        uses: "Aspirin is used to treat pain, fever, and inflammation. Low doses are used to prevent heart attacks, strokes, and blood clots.",
        dosage: "Pain/fever: 325-650 mg every 4 hours. Cardiac protection: 81-325 mg daily. Maximum 4000 mg per day for pain.",
        sideEffects: [
            "Upset stomach",
            "Heartburn",
            "Tinnitus",
            "Reye's syndrome in children",
            "Increased bleeding tendency"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Methotrexate", level: "high", description: "Increased toxicity" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" }
        ],
        safety: "Do not use in children with viral infections due to Reye's syndrome risk. Increased bleeding risk. Avoid in peptic ulcer disease."
    },

    "Tramadol": {
        class: "Opioid Analgesic",
        brandNames: "Ultram, ConZip, Ryzolt",
        administration: "Oral",
        halfLife: "5-7 hours",
        uses: "Tramadol is used to treat moderate to moderately severe pain. It works in the brain to change how your body feels and responds to pain.",
        dosage: "Adults: 50-100 mg every 4-6 hours as needed. Maximum 400 mg per day. Extended-release: 100-300 mg once daily.",
        sideEffects: [
            "Dizziness",
            "Drowsiness",
            "Nausea",
            "Constipation",
            "Headache",
            "Sweating"
        ],
        interactions: [
            { drug: "SSRIs/SNRIs", level: "high", description: "Increased risk of serotonin syndrome" },
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedation" }
        ],
        safety: "Risk of addiction, abuse, and misuse. May cause life-threatening serotonin syndrome. Do not crush or chew extended-release tablets."
    },

    "Morphine": {
        class: "Opioid Analgesic",
        brandNames: "MS Contin, Roxanol, Kadian",
        administration: "Oral, IV, IM, SC, Rectal",
        halfLife: "2-4 hours",
        uses: "Morphine is used to treat moderate to severe acute and chronic pain. It is also used for pain associated with myocardial infarction and during surgical procedures.",
        dosage: "Oral: 10-30 mg every 4 hours. IV: 2.5-15 mg every 4 hours. Extended-release: Dosing varies by product.",
        sideEffects: [
            "Respiratory depression",
            "Sedation",
            "Nausea and vomiting",
            "Constipation",
            "Pruritus",
            "Hypotension"
        ],
        interactions: [
            { drug: "Benzodiazepines", level: "high", description: "Profound sedation and respiratory depression" },
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" },
            { drug: "Alcohol", level: "high", description: "Enhanced CNS depression" }
        ],
        safety: "High potential for abuse and addiction. Monitor for respiratory depression. Use with caution in elderly and debilitated patients."
    },

    "Codeine": {
        class: "Opioid Analgesic",
        brandNames: "Various generic formulations",
        administration: "Oral",
        halfLife: "3-4 hours",
        uses: "Codeine is used to treat mild to moderate pain and as a cough suppressant. It is often combined with acetaminophen or aspirin for enhanced pain relief.",
        dosage: "Pain: 15-60 mg every 4-6 hours. Cough: 10-20 mg every 4-6 hours. Maximum 360 mg daily.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Nausea",
            "Constipation",
            "Respiratory depression",
            "Pruritus"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Enhanced sedation" },
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" }
        ],
        safety: "Risk of life-threatening respiratory depression in children. Genetic variation in metabolism affects efficacy and safety. Potential for abuse and dependence."
    },

    "Oxycodone": {
        class: "Opioid Analgesic",
        brandNames: "OxyContin, Roxicodone, Percocet (with acetaminophen)",
        administration: "Oral",
        halfLife: "3-5 hours",
        uses: "Oxycodone is used for management of moderate to severe pain when a continuous, around-the-clock analgesic is needed for an extended period of time.",
        dosage: "Immediate-release: 5-15 mg every 4-6 hours. Extended-release: 10-80 mg every 12 hours. Adjust based on pain severity.",
        sideEffects: [
            "Nausea",
            "Constipation",
            "Drowsiness",
            "Dizziness",
            "Headache",
            "Dry mouth"
        ],
        interactions: [
            { drug: "Benzodiazepines", level: "high", description: "Profound sedation and respiratory depression" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "Increased oxycodone levels" },
            { drug: "Alcohol", level: "high", description: "Enhanced CNS depression" }
        ],
        safety: "High abuse potential. Risk of addiction even with appropriate use. Do not crush or chew extended-release tablets. Monitor for respiratory depression."
    },

    "Hydrocodone": {
        class: "Opioid Analgesic",
        brandNames: "Vicodin, Norco, Lortab (with acetaminophen)",
        administration: "Oral",
        halfLife: "3.8-6 hours",
        uses: "Hydrocodone is used to relieve severe pain. It is often combined with other non-opioid pain relievers and is also used as an antitussive.",
        dosage: "2.5-10 mg every 4-6 hours as needed. Maximum dose depends on acetaminophen content in combination products.",
        sideEffects: [
            "Dizziness",
            "Drowsiness",
            "Nausea",
            "Constipation",
            "Respiratory depression",
            "Headache"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Enhanced sedation" },
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" }
        ],
        safety: "High potential for abuse and dependence. Risk of fatal respiratory depression. Monitor for signs of misuse or abuse. Do not exceed maximum daily acetaminophen dose."
    },

    "Fentanyl": {
        class: "Opioid Analgesic",
        brandNames: "Duragesic, Actiq, Sublimaze",
        administration: "Transdermal, Buccal, IV, IM",
        halfLife: "3-12 hours (varies by formulation)",
        uses: "Fentanyl is used for management of breakthrough cancer pain in opioid-tolerant patients and for anesthesia and postoperative pain control.",
        dosage: "Transdermal: 12-100 mcg/hour applied every 72 hours. Buccal: 100-800 mcg as needed. IV: 50-100 mcg for anesthesia.",
        sideEffects: [
            "Respiratory depression",
            "Hypotension",
            "Bradycardia",
            "Muscle rigidity",
            "Nausea",
            "Sedation"
        ],
        interactions: [
            { drug: "CYP3A4 inhibitors", level: "high", description: "Increased fentanyl levels" },
            { drug: "CNS depressants", level: "high", description: "Enhanced respiratory depression" },
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" }
        ],
        safety: "Only for opioid-tolerant patients. High risk of fatal respiratory depression. Proper disposal of patches required. Avoid heat exposure to patch application sites."
    },

    "Buprenorphine": {
        class: "Partial Opioid Agonist",
        brandNames: "Suboxone, Subutex, Butrans",
        administration: "Sublingual, Transdermal, IV, IM",
        halfLife: "24-42 hours",
        uses: "Buprenorphine is used for management of opioid dependence and for treatment of moderate to severe chronic pain.",
        dosage: "Opioid dependence: 4-24 mg sublingually daily. Pain: Transdermal 5-20 mcg/hour weekly. Adjust based on response.",
        sideEffects: [
            "Headache",
            "Insomnia",
            "Nausea",
            "Constipation",
            "Sweating",
            "Dizziness"
        ],
        interactions: [
            { drug: "Benzodiazepines", level: "high", description: "Respiratory depression risk" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "Increased buprenorphine levels" },
            { drug: "Opioid antagonists", level: "high", description: "Precipitated withdrawal" }
        ],
        safety: "Risk of life-threatening respiratory depression. Can cause dependence. Special prescribing requirements for addiction treatment. Monitor for withdrawal symptoms."
    },

    "Pethidine": {
        class: "Opioid Analgesic",
        brandNames: "Demerol, Meperidine",
        administration: "Oral, IV, IM",
        halfLife: "3-5 hours",
        uses: "Pethidine is used for the treatment of moderate to severe pain, particularly in obstetric and postoperative settings.",
        dosage: "50-150 mg every 3-4 hours as needed. Maximum 600 mg daily. Reduce dose in elderly or debilitated patients.",
        sideEffects: [
            "Dizziness",
            "Sedation",
            "Nausea",
            "Sweating",
            "Respiratory depression",
            "Seizures (with metabolite accumulation)"
        ],
        interactions: [
            { drug: "MAO inhibitors", level: "high", description: "Serotonin syndrome risk" },
            { drug: "SSRIs", level: "high", description: "Increased serotonin syndrome risk" },
            { drug: "CNS depressants", level: "high", description: "Enhanced sedation" }
        ],
        safety: "Not recommended for chronic pain due to neurotoxic metabolite accumulation. Risk of seizures with renal impairment. High abuse potential."
    },

    "Celecoxib": {
        class: "COX-2 Selective NSAID",
        brandNames: "Celebrex",
        administration: "Oral",
        halfLife: "11 hours",
        uses: "Celecoxib is used for relief of pain, inflammation, and stiffness caused by osteoarthritis, rheumatoid arthritis, and ankylosing spondylitis.",
        dosage: "Osteoarthritis: 200 mg daily or 100 mg twice daily. Rheumatoid arthritis: 100-200 mg twice daily. Maximum 400 mg daily.",
        sideEffects: [
            "Headache",
            "Dyspepsia",
            "Diarrhea",
            "Abdominal pain",
            "Peripheral edema",
            "Hypertension"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "ACE inhibitors", level: "medium", description: "Reduced antihypertensive effect" },
            { drug: "Lithium", level: "medium", description: "Increased lithium levels" }
        ],
        safety: "Increased risk of serious cardiovascular thrombotic events. Contraindicated in sulfonamide allergy. Use lowest effective dose for shortest duration."
    },

    "Etoricoxib": {
        class: "COX-2 Selective NSAID",
        brandNames: "Arcoxia",
        administration: "Oral",
        halfLife: "22 hours",
        uses: "Etoricoxib is used for acute and chronic treatment of osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, and acute gouty arthritis.",
        dosage: "Osteoarthritis: 30-60 mg once daily. Rheumatoid arthritis: 90 mg once daily. Acute gout: 120 mg once daily for 8 days.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Hypertension",
            "Edema",
            "Dyspepsia",
            "Elevated liver enzymes"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased INR and bleeding risk" },
            { drug: "Lithium", level: "medium", description: "Increased lithium levels" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" }
        ],
        safety: "Increased cardiovascular risk. Not approved in United States. Contraindicated in severe heart failure, coronary artery disease, and cerebrovascular disease."
    },

    "Indomethacin": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Indocin, Tivorbex",
        administration: "Oral, Rectal, IV",
        halfLife: "4.5-6 hours",
        uses: "Indomethacin is used for moderate to severe rheumatoid arthritis, osteoarthritis, ankylosing spondylitis, and acute painful shoulder.",
        dosage: "25-50 mg two or three times daily. Maximum 200 mg daily. Extended-release: 75 mg once or twice daily.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Gastrointestinal bleeding",
            "Tinnitus",
            "Fluid retention",
            "Renal impairment"
        ],
        interactions: [
            { drug: "Probenecid", level: "high", description: "Increased indomethacin levels" },
            { drug: "Digoxin", level: "medium", description: "Increased digoxin levels" },
            { drug: "Diuretics", level: "medium", description: "Reduced diuretic effect" }
        ],
        safety: "High incidence of CNS side effects. Increased risk of gastrointestinal bleeding. Use with caution in elderly patients. Monitor renal function."
    },

    "Nimesulide": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Nimalox, Mesulid, Nimulid",
        administration: "Oral, Topical",
        halfLife: "2-5 hours",
        uses: "Nimesulide is used for short-term treatment of acute pain, primary dysmenorrhea, and osteoarthritis.",
        dosage: "100 mg twice daily after meals. Maximum 200 mg daily. Treatment should not exceed 15 days.",
        sideEffects: [
            "Heartburn",
            "Nausea",
            "Diarrhea",
            "Rash",
            "Dizziness",
            "Elevated liver enzymes"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "medium", description: "Increased lithium levels" },
            { drug: "Methotrexate", level: "high", description: "Increased methotrexate toxicity" }
        ],
        safety: "Risk of severe hepatotoxicity. Banned in several countries. Use only for short-term treatment. Monitor liver function regularly."
    },

    "Meloxicam": {
        class: "NSAID (Nonsteroidal Anti-inflammatory Drug)",
        brandNames: "Mobic, Vivlodex",
        administration: "Oral",
        halfLife: "15-20 hours",
        uses: "Meloxicam is used for relief of pain and inflammation in osteoarthritis and rheumatoid arthritis.",
        dosage: "7.5-15 mg once daily. Maximum 15 mg daily. Take with food to reduce gastrointestinal upset.",
        sideEffects: [
            "Abdominal pain",
            "Diarrhea",
            "Nausea",
            "Headache",
            "Edema",
            "Elevated blood pressure"
        ],
        interactions: [
            { drug: "Aspirin", level: "medium", description: "Increased gastrointestinal side effects" },
            { drug: "Warfarin", level: "high", description: "Increased bleeding risk" },
            { drug: "Lithium", level: "medium", description: "Increased lithium levels" }
        ],
        safety: "Increased risk of serious cardiovascular and gastrointestinal events. Use lowest effective dose for shortest duration. Monitor for signs of gastrointestinal bleeding."
    },

    "Alendronate": {
        class: "Bisphosphonate",
        brandNames: "Fosamax, Binosto",
        administration: "Oral",
        halfLife: ">10 years (bone), 0.5-1 hour (plasma)",
        uses: "Alendronate is used for treatment and prevention of osteoporosis in postmenopausal women and treatment of osteoporosis in men.",
        dosage: "Treatment: 70 mg once weekly or 10 mg daily. Prevention: 35 mg once weekly or 5 mg daily.",
        sideEffects: [
            "Abdominal pain",
            "Nausea",
            "Heartburn",
            "Musculoskeletal pain",
            "Esophageal ulceration",
            "Hypocalcemia"
        ],
        interactions: [
            { drug: "Calcium supplements", level: "high", description: "Reduced absorption if taken together" },
            { drug: "Antacids", level: "high", description: "Reduced absorption" },
            { drug: "PPIs", level: "medium", description: "May reduce efficacy" }
        ],
        safety: "Must be taken with full glass of water on empty stomach. Remain upright for 30 minutes after dose. Not recommended in severe renal impairment."
    },

    "Risedronate": {
        class: "Bisphosphonate",
        brandNames: "Actonel, Atelvia",
        administration: "Oral",
        halfLife: "Terminal: 480 hours",
        uses: "Risedronate is used for treatment and prevention of osteoporosis in postmenopausal women and treatment of osteoporosis in men.",
        dosage: "35 mg once weekly or 5 mg daily. 150 mg once monthly also available. Take at least 30 minutes before first food or drink.",
        sideEffects: [
            "Abdominal pain",
            "Diarrhea",
            "Headache",
            "Muscle pain",
            "Joint pain",
            "Esophageal irritation"
        ],
        interactions: [
            { drug: "Calcium supplements", level: "high", description: "Reduced absorption" },
            { drug: "Antacids", level: "high", description: "Reduced absorption" },
            { drug: "PPIs", level: "medium", description: "May reduce efficacy" }
        ],
        safety: "Take with full glass of plain water. Remain upright for 30 minutes. Not recommended in severe renal impairment (CrCl <30 mL/min)."
    },

    "Ibandronate": {
        class: "Bisphosphonate",
        brandNames: "Boniva",
        administration: "Oral, IV",
        halfLife: "10-60 hours",
        uses: "Ibandronate is used for treatment and prevention of osteoporosis in postmenopausal women.",
        dosage: "Oral: 150 mg once monthly or 2.5 mg daily. IV: 3 mg every 3 months.",
        sideEffects: [
            "Dyspepsia",
            "Abdominal pain",
            "Diarrhea",
            "Headache",
            "Musculoskeletal pain",
            "Flu-like symptoms (IV)"
        ],
        interactions: [
            { drug: "Calcium supplements", level: "high", description: "Reduced absorption" },
            { drug: "Antacids", level: "high", description: "Reduced absorption" },
            { drug: "Aminoglycosides", level: "medium", description: "Increased hypocalcemia risk" }
        ],
        safety: "Oral: Take with full glass of water, remain upright 60 minutes. IV: Ensure adequate hydration. Not recommended in severe renal impairment."
    },

    "Zoledronic acid": {
        class: "Bisphosphonate",
        brandNames: "Reclast, Zometa",
        administration: "IV",
        halfLife: "146 hours",
        uses: "Zoledronic acid is used for treatment of osteoporosis, Paget's disease of bone, and prevention of skeletal-related events in cancer patients.",
        dosage: "Osteoporosis: 5 mg IV once yearly. Paget's disease: 5 mg single dose. Cancer: 4 mg every 3-4 weeks.",
        sideEffects: [
            "Flu-like symptoms",
            "Fever",
            "Muscle pain",
            "Headache",
            "Hypocalcemia",
            "Renal impairment"
        ],
        interactions: [
            { drug: "Aminoglycosides", level: "high", description: "Increased hypocalcemia risk" },
            { drug: "Loop diuretics", level: "medium", description: "Increased hypocalcemia risk" },
            { drug: "Nephrotoxic drugs", level: "high", description: "Increased renal toxicity risk" }
        ],
        safety: "Risk of osteonecrosis of the jaw and atypical femoral fractures. Pre-hydrate with 500 mL fluid before infusion. Monitor renal function and calcium levels."
    },

    "Denosumab": {
        class: "RANK Ligand Inhibitor",
        brandNames: "Prolia, Xgeva",
        administration: "Subcutaneous",
        halfLife: "25-28 days",
        uses: "Denosumab is used for treatment of osteoporosis in postmenopausal women and men at high risk for fracture, and for prevention of skeletal-related events in bone metastases.",
        dosage: "Osteoporosis: 60 mg every 6 months. Cancer: 120 mg every 4 weeks.",
        sideEffects: [
            "Back pain",
            "Pain in extremities",
            "Musculoskeletal pain",
            "Hypercholesterolemia",
            "Cystitis",
            "Hypocalcemia"
        ],
        interactions: [
            { drug: "Immunosuppressants", level: "medium", description: "Increased infection risk" },
            { drug: "Calcium/Vitamin D", level: "high", description: "Required to prevent hypocalcemia" }
        ],
        safety: "Risk of severe hypocalcemia. Must ensure adequate calcium and vitamin D intake. Increased risk of serious infections. Monitor for signs of infection."
    },

    "Teriparatide": {
        class: "Parathyroid Hormone Analog",
        brandNames: "Forteo",
        administration: "Subcutaneous",
        halfLife: "1 hour",
        uses: "Teriparatide is used for treatment of osteoporosis in postmenopausal women and men at high risk for fracture who have failed or are intolerant to other therapy.",
        dosage: "20 mcg once daily. Maximum treatment duration 2 years due to osteosarcoma risk in animal studies.",
        sideEffects: [
            "Dizziness",
            "Leg cramps",
            "Nausea",
            "Joint pain",
            "Injection site reactions",
            "Orthostatic hypotension"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May increase digoxin toxicity" },
            { drug: "Hypercalcemic agents", level: "high", description: "Increased hypercalcemia risk" }
        ],
        safety: "Black box warning for osteosarcoma risk. Not for patients with increased baseline risk of osteosarcoma. Maximum 2-year lifetime use. Monitor calcium levels."
    },

    "Calcitonin": {
        class: "Polypeptide Hormone",
        brandNames: "Miacalcin, Fortical",
        administration: "Nasal, SC, IM",
        halfLife: "43 minutes (IV), 22 minutes (SC/IM)",
        uses: "Calcitonin is used for treatment of osteoporosis in women more than 5 years postmenopause, and for Paget's disease and hypercalcemia.",
        dosage: "Osteoporosis: 200 units (one spray) daily alternating nostrils. Paget's disease: 100 units SC/IM daily.",
        sideEffects: [
            "Nasal irritation (nasal spray)",
            "Nausea",
            "Flushing",
            "Skin rash",
            "Increased urination",
            "Allergic reactions"
        ],
        interactions: [
            { drug: "Lithium", level: "medium", description: "May decrease lithium levels" }
        ],
        safety: "Increased risk of malignancies with long-term use. Nasal form may cause nasal ulcers. Test for nasal patency before starting nasal spray."
    },

    "Raloxifene": {
        class: "Selective Estrogen Receptor Modulator (SERM)",
        brandNames: "Evista",
        administration: "Oral",
        halfLife: "27.7-32.5 hours",
        uses: "Raloxifene is used for prevention and treatment of osteoporosis in postmenopausal women and reduction in risk of invasive breast cancer.",
        dosage: "60 mg once daily. May be taken without regard to meals.",
        sideEffects: [
            "Hot flashes",
            "Leg cramps",
            "Swelling",
            "Joint pain",
            "Increased mortality from stroke",
            "Venous thromboembolism"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May decrease PT time" },
            { drug: "Cholestyramine", level: "high", description: "Reduced raloxifene absorption" },
            { drug: "Estrogens", level: "medium", description: "Not recommended for concomitant use" }
        ],
        safety: "Increased risk of venous thromboembolism and fatal stroke. Discontinue at least 72 hours before prolonged immobilization. Not for use in premenopausal women."
    },
    "Ondansetron": {
        class: "5-HT3 Receptor Antagonist",
        brandNames: "Zofran, Zuplenz",
        administration: "Oral, IV, IM",
        halfLife: "4-6 hours",
        uses: "Ondansetron is used to prevent nausea and vomiting caused by cancer chemotherapy, radiation therapy, and surgery.",
        dosage: "For chemotherapy: 8-24 mg before treatment. For surgery: 4-8 mg before anesthesia. For radiation: 8 mg three times daily.",
        sideEffects: [
            "Headache",
            "Constipation",
            "Diarrhea",
            "Dizziness",
            "Fatigue",
            "Fever"
        ],
        interactions: [
            { drug: "Apomorphine", level: "high", description: "May cause severe hypotension and loss of consciousness" },
            { drug: "Tramadol", level: "medium", description: "May reduce analgesic effect" },
            { drug: "Serotonergic drugs", level: "medium", description: "Increased risk of serotonin syndrome" }
        ],
        safety: "May cause QT prolongation. Use with caution in patients with cardiac conditions. Not for routine treatment of morning sickness during pregnancy."
    },

    "Granisetron": {
        class: "5-HT3 Receptor Antagonist",
        brandNames: "Kytril, Sancuso",
        administration: "Oral, IV, Transdermal",
        halfLife: "6-9 hours",
        uses: "Granisetron is used to prevent nausea and vomiting associated with cancer chemotherapy and radiation therapy.",
        dosage: "Oral: 2 mg once daily or 1 mg twice daily. IV: 10 mcg/kg. Transdermal patch: apply 24-48 hours before chemotherapy.",
        sideEffects: [
            "Headache",
            "Constipation",
            "Weakness",
            "Diarrhea",
            "Abdominal pain"
        ],
        interactions: [
            { drug: "Apomorphine", level: "high", description: "Contraindicated - may cause severe hypotension" },
            { drug: "Other antiemetics", level: "low", description: "No significant interactions reported" }
        ],
        safety: "May cause QT interval prolongation. Use with caution in patients with congenital long QT syndrome. Monitor ECG in patients with cardiac disease."
    },

    "Metoclopramide": {
        class: "Dopamine Antagonist, Prokinetic Agent",
        brandNames: "Reglan, Metozolv",
        administration: "Oral, IV, IM",
        halfLife: "5-6 hours",
        uses: "Metoclopramide is used to treat gastroesophageal reflux disease (GERD), diabetic gastroparesis, and to prevent chemotherapy-induced nausea and vomiting.",
        dosage: "For GERD: 10-15 mg up to 4 times daily. For gastroparesis: 10 mg 30 minutes before meals. Maximum 60 mg/day.",
        sideEffects: [
            "Restlessness",
            "Drowsiness",
            "Fatigue",
            "Diarrhea",
            "Extrapyramidal symptoms",
            "Tardive dyskinesia"
        ],
        interactions: [
            { drug: "Antipsychotics", level: "high", description: "Increased risk of extrapyramidal symptoms" },
            { drug: "Alcohol", level: "medium", description: "Increased sedative effect" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased risk of hypertension" }
        ],
        safety: "Risk of tardive dyskinesia with long-term use. Treatment should not exceed 12 weeks. Use with caution in elderly patients."
    },

    "Domperidone": {
        class: "Dopamine Antagonist, Prokinetic Agent",
        brandNames: "Motilium",
        administration: "Oral",
        halfLife: "7-14 hours",
        uses: "Domperidone is used to treat nausea and vomiting, and to stimulate lactation in breastfeeding women.",
        dosage: "For nausea/vomiting: 10-20 mg 3-4 times daily. For lactation: 10 mg three times daily. Maximum 80 mg/day.",
        sideEffects: [
            "Dry mouth",
            "Headache",
            "Abdominal cramps",
            "Diarrhea",
            "Galactorrhea"
        ],
        interactions: [
            { drug: "QT-prolonging drugs", level: "high", description: "Increased risk of cardiac arrhythmias" },
            { drug: "Ketoconazole", level: "high", description: "Contraindicated - may cause serious cardiac events" },
            { drug: "Anticholinergics", level: "medium", description: "May reduce domperidone effect" }
        ],
        safety: "May cause QT prolongation and serious ventricular arrhythmias. Contraindicated in patients with cardiac conditions. Not FDA-approved in the US."
    },

    "Promethazine": {
        class: "Phenothiazine Antihistamine",
        brandNames: "Phenergan",
        administration: "Oral, IV, IM, Rectal",
        halfLife: "9-16 hours",
        uses: "Promethazine is used to treat allergies, motion sickness, nausea and vomiting, and as a sedative before surgery.",
        dosage: "For nausea: 12.5-25 mg every 4-6 hours. For allergies: 25 mg at bedtime. Maximum 100 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Blurred vision",
            "Dry mouth",
            "Constipation"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "MAO inhibitors", level: "high", description: "Increased risk of anticholinergic effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" }
        ],
        safety: "May cause severe tissue injury with IV administration. Avoid in children under 2 years due to risk of fatal respiratory depression."
    },

    "Prochlorperazine": {
        class: "Phenothiazine Antipsychotic",
        brandNames: "Compazine",
        administration: "Oral, IV, IM, Rectal",
        halfLife: "6-10 hours",
        uses: "Prochlorperazine is used to treat severe nausea and vomiting, and for the management of schizophrenia and anxiety.",
        dosage: "For nausea: 5-10 mg 3-4 times daily. For psychosis: 10-20 mg 3-4 times daily. Maximum 150 mg/day.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Extrapyramidal symptoms",
            "Dry mouth",
            "Blurred vision",
            "Orthostatic hypotension"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "Anticholinergics", level: "medium", description: "Increased anticholinergic effects" },
            { drug: "Lithium", level: "medium", description: "Increased risk of neurotoxicity" }
        ],
        safety: "Risk of tardive dyskinesia with long-term use. May cause neuroleptic malignant syndrome. Use with caution in elderly patients with dementia."
    },

    "Dimenhydrinate": {
        class: "Antihistamine",
        brandNames: "Dramamine",
        administration: "Oral, IV, IM",
        halfLife: "5-8 hours",
        uses: "Dimenhydrinate is used to prevent and treat nausea, vomiting, and dizziness caused by motion sickness.",
        dosage: "50-100 mg every 4-6 hours as needed. Maximum 400 mg/day. Take 30 minutes before travel for motion sickness.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Blurred vision",
            "Constipation",
            "Urinary retention"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause drowsiness - avoid driving or operating machinery. Use with caution in patients with glaucoma, prostate enlargement, or respiratory conditions."
    },

    "Meclizine": {
        class: "Antihistamine",
        brandNames: "Antivert, Bonine",
        administration: "Oral",
        halfLife: "5-6 hours",
        uses: "Meclizine is used to prevent and treat nausea, vomiting, and dizziness caused by motion sickness, and to manage vertigo.",
        dosage: "For motion sickness: 25-50 mg 1 hour before travel. For vertigo: 25-100 mg daily in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Dry mouth",
            "Fatigue",
            "Blurred vision",
            "Headache"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Anticholinergics", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause drowsiness - use caution when driving or operating machinery. Avoid in children under 12 years. Use with caution in elderly patients."
    },

    "Scopolamine": {
        class: "Anticholinergic",
        brandNames: "Transderm Scop",
        administration: "Transdermal patch",
        halfLife: "9.5 hours",
        uses: "Scopolamine is used to prevent nausea and vomiting caused by motion sickness or recovery from anesthesia and surgery.",
        dosage: "Apply one patch behind ear at least 4 hours before needed. Replace every 3 days if needed.",
        sideEffects: [
            "Dry mouth",
            "Blurred vision",
            "Drowsiness",
            "Dizziness",
            "Dilated pupils"
        ],
        interactions: [
            { drug: "Anticholinergics", level: "high", description: "Increased anticholinergic effects" },
            { drug: "CNS depressants", level: "medium", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "medium", description: "Increased CNS depression" }
        ],
        safety: "Wash hands after handling patch to avoid accidental eye exposure. Contraindicated in patients with glaucoma, prostate enlargement, or bowel obstruction."
    },

    "Doxylamine": {
        class: "Antihistamine",
        brandNames: "Unisom, Diclegis",
        administration: "Oral",
        halfLife: "10-12 hours",
        uses: "Doxylamine is used to treat insomnia and, in combination with pyridoxine, for nausea and vomiting of pregnancy.",
        dosage: "For insomnia: 25 mg at bedtime. For pregnancy nausea: 10-20 mg at bedtime or in divided doses.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Dry mouth",
            "Headache",
            "Constipation"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "MAO inhibitors", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause significant drowsiness. Avoid alcohol. Use with caution in elderly patients. Pregnancy category A when used as directed for morning sickness."
    },

    "Trimethobenzamide": {
        class: "Antiemetic",
        brandNames: "Tigan",
        administration: "Oral, IM, Rectal",
        halfLife: "7-9 hours",
        uses: "Trimethobenzamide is used to treat nausea and vomiting, particularly in postoperative settings.",
        dosage: "Oral: 300 mg 3-4 times daily. IM: 200 mg 3-4 times daily. Rectal: 200 mg 3-4 times daily.",
        sideEffects: [
            "Drowsiness",
            "Dizziness",
            "Headache",
            "Blurred vision",
            "Diarrhea"
        ],
        interactions: [
            { drug: "CNS depressants", level: "high", description: "Increased sedative effects" },
            { drug: "Alcohol", level: "high", description: "Increased CNS depression" },
            { drug: "Anticholinergics", level: "medium", description: "Increased anticholinergic effects" }
        ],
        safety: "May cause drowsiness - avoid driving or operating machinery. Contraindicated in children with viral illnesses due to risk of Reye's syndrome."
    },

    "Mesalamine": {
        class: "5-aminosalicylate",
        brandNames: "Asacol, Lialda, Pentasa",
        administration: "Oral, Rectal",
        halfLife: "0.5-1.5 hours",
        uses: "Mesalamine is used to treat ulcerative colitis and to maintain remission of ulcerative colitis.",
        dosage: "Oral: 2.4-4.8 g daily in divided doses. Rectal: 1-4 g daily as suppository or enema.",
        sideEffects: [
            "Headache",
            "Abdominal pain",
            "Nausea",
            "Diarrhea",
            "Rash"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Azathioprine", level: "medium", description: "Increased risk of blood disorders" },
            { drug: "NSAIDs", level: "low", description: "May decrease mesalamine effectiveness" }
        ],
        safety: "May cause kidney damage - monitor renal function during treatment. Report any unexplained bleeding, bruising, or sore throat immediately."
    },

    "Sulfasalazine": {
        class: "Sulfonamide, 5-aminosalicylate",
        brandNames: "Azulfidine",
        administration: "Oral",
        halfLife: "5-10 hours",
        uses: "Sulfasalazine is used to treat ulcerative colitis, rheumatoid arthritis, and juvenile rheumatoid arthritis.",
        dosage: "For colitis: 3-4 g daily in divided doses. For arthritis: 2-3 g daily. Start with lower dose and increase gradually.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Loss of appetite",
            "Orange-yellow discoloration of urine",
            "Skin rash"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "May reduce digoxin absorption" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Methotrexate", level: "medium", description: "Increased risk of bone marrow suppression" }
        ],
        safety: "May cause serious blood disorders. Monitor CBC regularly. Contraindicated in patients with sulfa allergy. Maintain adequate hydration to prevent kidney stones."
    },

    "Azathioprine": {
        class: "Immunosuppressant",
        brandNames: "Imuran",
        administration: "Oral, IV",
        halfLife: "3 hours",
        uses: "Azathioprine is used to prevent organ transplant rejection and to treat rheumatoid arthritis and autoimmune diseases.",
        dosage: "Transplant: 3-5 mg/kg/day. Rheumatoid arthritis: 1-2.5 mg/kg/day. Start with lower dose and titrate upward.",
        sideEffects: [
            "Nausea",
            "Vomiting",
            "Infection risk",
            "Bone marrow suppression",
            "Liver toxicity"
        ],
        interactions: [
            { drug: "Allopurinol", level: "high", description: "Significantly increases azathioprine toxicity" },
            { drug: "Warfarin", level: "medium", description: "May decrease anticoagulant effect" },
            { drug: "ACE inhibitors", level: "medium", description: "Increased risk of anemia" }
        ],
        safety: "Requires regular monitoring of CBC and liver function tests. Increased risk of infection and malignancy. Not for use during pregnancy."
    },

    "Infliximab": {
        class: "TNF-alpha Inhibitor",
        brandNames: "Remicade",
        administration: "IV Infusion",
        halfLife: "7-12 days",
        uses: "Infliximab is used to treat Crohn's disease, ulcerative colitis, rheumatoid arthritis, psoriatic arthritis, and ankylosing spondylitis.",
        dosage: "3-10 mg/kg by IV infusion at 0, 2, and 6 weeks, then every 8 weeks. Dose varies by condition.",
        sideEffects: [
            "Infusion reactions",
            "Infection risk",
            "Headache",
            "Fever",
            "Liver enzyme elevation"
        ],
        interactions: [
            { drug: "Anakinra", level: "high", description: "Increased risk of serious infections" },
            { drug: "Vaccines", level: "medium", description: "Live vaccines contraindicated" },
            { drug: "Other biologics", level: "high", description: "Increased risk of infection" }
        ],
        safety: "Increased risk of serious infections, including tuberculosis. Screen for TB before treatment. May increase risk of lymphoma and other malignancies."
    },

    "Adalimumab": {
        class: "TNF-alpha Inhibitor",
        brandNames: "Humira",
        administration: "Subcutaneous",
        halfLife: "10-20 days",
        uses: "Adalimumab is used to treat rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, Crohn's disease, ulcerative colitis, and psoriasis.",
        dosage: "40 mg every other week for most indications. Some conditions may require weekly dosing. Administer by subcutaneous injection.",
        sideEffects: [
            "Injection site reactions",
            "Infection risk",
            "Headache",
            "Rash",
            "Nausea"
        ],
        interactions: [
            { drug: "Anakinra", level: "high", description: "Increased risk of serious infections" },
            { drug: "Vaccines", level: "medium", description: "Live vaccines contraindicated" },
            { drug: "Methotrexate", level: "low", description: "May reduce antibody formation" }
        ],
        safety: "Increased risk of serious infections. Screen for tuberculosis before treatment. May increase risk of lymphoma. Monitor for signs of infection during treatment."
    },

    "Budesonide": {
        class: "Corticosteroid",
        brandNames: "Entocort, Uceris, Pulmicort",
        administration: "Oral, Inhalation, Nasal",
        halfLife: "2-3 hours",
        uses: "Budesonide is used to treat Crohn's disease, ulcerative colitis, asthma, and allergic rhinitis.",
        dosage: "For IBD: 9 mg daily for 8 weeks. For asthma: 180-360 mcg twice daily. For rhinitis: 64 mcg per nostril daily.",
        sideEffects: [
            "Headache",
            "Nausea",
            "Respiratory infection",
            "Oral candidiasis",
            "Dyspepsia"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "high", description: "Significantly increases budesonide levels" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "May increase budesonide exposure" },
            { drug: "Other corticosteroids", level: "medium", description: "Additive steroid effects" }
        ],
        safety: "Rinse mouth after inhalation to prevent oral thrush. Taper dose gradually when discontinuing long-term treatment. Monitor for adrenal suppression with long-term use."
    },

    "Methotrexate": {
        class: "Antimetabolite, DMARD",
        brandNames: "Trexall, Rheumatrex",
        administration: "Oral, IV, IM, Subcutaneous",
        halfLife: "3-10 hours",
        uses: "Methotrexate is used to treat rheumatoid arthritis, psoriasis, and various cancers including leukemia and lymphoma.",
        dosage: "For arthritis: 7.5-25 mg once weekly. For cancer: much higher doses based on protocol. MUST be taken weekly, not daily.",
        sideEffects: [
            "Nausea",
            "Mouth sores",
            "Liver toxicity",
            "Bone marrow suppression",
            "Pulmonary toxicity"
        ],
        interactions: [
            { drug: "NSAIDs", level: "high", description: "Increased methotrexate toxicity" },
            { drug: "Probenecid", level: "high", description: "Increased methotrexate levels" },
            { drug: "Trimethoprim", level: "high", description: "Increased bone marrow toxicity" }
        ],
        safety: "REQUIRES weekly dosing - daily dosing can be fatal. Regular monitoring of CBC and liver function tests essential. Folic acid supplementation recommended."
    },

    "Vedolizumab": {
        class: "Integrin Receptor Antagonist",
        brandNames: "Entyvio",
        administration: "IV Infusion",
        halfLife: "25 days",
        uses: "Vedolizumab is used to treat moderate to severe ulcerative colitis and Crohn's disease.",
        dosage: "300 mg by IV infusion at 0, 2, and 6 weeks, then every 8 weeks thereafter.",
        sideEffects: [
            "Headache",
            "Nasopharyngitis",
            "Arthralgia",
            "Nausea",
            "Fever",
            "Fatigue"
        ],
        interactions: [
            { drug: "TNF blockers", level: "medium", description: "Increased risk of infection" },
            { drug: "Natalizumab", level: "high", description: "Contraindicated - increased PML risk" },
            { drug: "Live vaccines", level: "high", description: "Contraindicated during treatment" }
        ],
        safety: "Screen for infections before treatment. Monitor for infusion reactions. Lower risk of PML compared to other integrin inhibitors but still requires vigilance."
    },
    "Prednisone": {
        class: "Corticosteroid",
        brandNames: "Deltasone, Rayos, Prednisone Intensol",
        administration: "Oral",
        halfLife: "2.5-3.5 hours",
        uses: "Prednisone is used to treat inflammatory conditions, allergic disorders, autoimmune diseases, and to prevent organ transplant rejection.",
        dosage: "Dosage varies widely based on condition. For inflammation: 5-60 mg daily. Always taper gradually when discontinuing long-term therapy.",
        sideEffects: [
            "Increased appetite and weight gain",
            "Fluid retention and swelling",
            "High blood pressure",
            "Mood changes and insomnia",
            "Increased blood sugar levels",
            "Weakened immune system"
        ],
        interactions: [
            { drug: "NSAIDs", level: "high", description: "Increased risk of gastrointestinal bleeding" },
            { drug: "Warfarin", level: "medium", description: "May alter anticoagulant effect" },
            { drug: "Diuretics", level: "medium", description: "May increase potassium loss" },
            { drug: "Vaccines", level: "high", description: "May reduce vaccine effectiveness" }
        ],
        safety: "Do not stop abruptly after long-term use. May cause adrenal insufficiency. Monitor blood glucose, blood pressure, and bone density with long-term use."
    },

    "Hydrocortisone": {
        class: "Corticosteroid",
        brandNames: "Cortef, Solu-Cortef, Hydrocortone",
        administration: "Oral, Topical, Injection",
        halfLife: "1.5-2 hours",
        uses: "Hydrocortisone is used to treat inflammation, allergic reactions, adrenal insufficiency, and certain skin conditions.",
        dosage: "For adrenal insufficiency: 15-25 mg daily in divided doses. For inflammation: 20-240 mg daily. Topical: Apply thin layer 1-4 times daily.",
        sideEffects: [
            "Skin thinning with topical use",
            "Acne and skin irritation",
            "Increased hair growth",
            "Allergic contact dermatitis",
            "Systemic effects with prolonged use"
        ],
        interactions: [
            { drug: "Barbiturates", level: "medium", description: "May increase corticosteroid metabolism" },
            { drug: "Estrogens", level: "medium", description: "May increase corticosteroid effects" },
            { drug: "Antifungal agents", level: "medium", description: "May increase corticosteroid levels" }
        ],
        safety: "Avoid prolonged use on large areas of skin. Do not use on broken or infected skin without medical supervision."
    },

    "Dexamethasone": {
        class: "Corticosteroid",
        brandNames: "Decadron, DexPak, Baycadron",
        administration: "Oral, Injection, Ophthalmic",
        halfLife: "36-54 hours",
        uses: "Dexamethasone is used for anti-inflammatory and immunosuppressant effects, cerebral edema, and as an antiemetic in chemotherapy.",
        dosage: "Dosage varies by indication. Range: 0.5-9 mg daily. For cerebral edema: 10 mg initially, then 4 mg every 6 hours.",
        sideEffects: [
            "Increased susceptibility to infections",
            "Hyperglycemia",
            "Hypertension",
            "Osteoporosis with long-term use",
            "Cataracts and glaucoma",
            "Psychiatric disturbances"
        ],
        interactions: [
            { drug: "Phenytoin", level: "medium", description: "May decrease dexamethasone effectiveness" },
            { drug: "Rifampin", level: "medium", description: "May increase corticosteroid metabolism" },
            { drug: "Antidiabetic drugs", level: "high", description: "May require dosage adjustment" }
        ],
        safety: "Long-term use requires gradual withdrawal. Monitor for signs of infection, glucose levels, and blood pressure regularly."
    },

    "Methylprednisolone": {
        class: "Corticosteroid",
        brandNames: "Medrol, Solu-Medrol, Depo-Medrol",
        administration: "Oral, Injection",
        halfLife: "18-40 hours",
        uses: "Methylprednisolone is used for inflammatory and allergic conditions, multiple sclerosis exacerbations, and as an immunosuppressant.",
        dosage: "Dosage pack: Follow specific decreasing schedule. Injection: 10-40 mg IV/IM. Multiple sclerosis: 200 mg daily for 1 week.",
        sideEffects: [
            "Insomnia and mood changes",
            "Increased appetite",
            "Gastrointestinal upset",
            "Fluid retention",
            "Elevated blood pressure",
            "Muscle weakness"
        ],
        interactions: [
            { drug: "Aspirin", level: "medium", description: "Increased risk of gastrointestinal ulceration" },
            { drug: "Cyclosporine", level: "medium", description: "Mutual inhibition of metabolism" },
            { drug: "Ketoconazole", level: "medium", description: "May increase methylprednisolone levels" }
        ],
        safety: "Do not discontinue abruptly. Use with caution in patients with diabetes, hypertension, or peptic ulcer disease."
    },

    "Triamcinolone": {
        class: "Corticosteroid",
        brandNames: "Kenalog, Aristospan, Triesence",
        administration: "Topical, Injection, Inhalation",
        halfLife: "88 minutes",
        uses: "Triamcinolone is used for inflammatory skin conditions, joint inflammation, allergic conditions, and oral lesions.",
        dosage: "Topical: Apply 2-4 times daily. Intramuscular: 2.5-60 mg. Intra-articular: 2.5-40 mg depending on joint size.",
        sideEffects: [
            "Skin atrophy with prolonged use",
            "Hypopigmentation",
            "Local burning or itching",
            "Systemic absorption with large areas",
            "Injection site pain"
        ],
        interactions: [
            { drug: "Other topical medications", level: "low", description: "May alter absorption of other topicals" }
        ],
        safety: "Avoid use on face, groin, or axillae for prolonged periods. Do not use occlusive dressings without medical supervision."
    },

    "Betamethasone": {
        class: "Corticosteroid",
        brandNames: "Celestone, Diprolene, Luxiq",
        administration: "Topical, Injection, Oral",
        halfLife: "36-54 hours",
        uses: "Betamethasone is used for inflammatory skin conditions, to accelerate fetal lung maturation, and for various inflammatory disorders.",
        dosage: "Topical: Apply 1-3 times daily. Oral: 0.6-7.2 mg daily. For fetal lung maturation: 12 mg IM every 24 hours for 2 doses.",
        sideEffects: [
            "Skin irritation and burning",
            "Folliculitis",
            "Contact dermatitis",
            "Hypothalamic-pituitary-adrenal axis suppression",
            "Cushing's syndrome with systemic use"
        ],
        interactions: [
            { drug: "Other corticosteroids", level: "high", description: "Additive effects and increased side effects" }
        ],
        safety: "Use during pregnancy only if clearly needed. Avoid prolonged use on large body surface areas."
    },

    "Fludrocortisone": {
        class: "Mineralocorticoid",
        brandNames: "Florinef",
        administration: "Oral",
        halfLife: "3.5 hours",
        uses: "Fludrocortisone is used for adrenal insufficiency, Addison's disease, and salt-losing adrenogenital syndrome.",
        dosage: "For Addison's disease: 0.1 mg daily. Range: 0.1-0.2 mg daily. May require adjustment based on clinical response.",
        sideEffects: [
            "Hypertension",
            "Edema and fluid retention",
            "Hypokalemia",
            "Headache",
            "Increased sweating"
        ],
        interactions: [
            { drug: "Diuretics", level: "high", description: "May cause excessive potassium loss" },
            { drug: "Digoxin", level: "medium", description: "Hypokalemia may increase digoxin toxicity" },
            { drug: "Barbiturates", level: "medium", description: "May increase fludrocortisone metabolism" }
        ],
        safety: "Monitor blood pressure, serum electrolytes, and weight regularly. Adjust dosage based on clinical response and laboratory values."
    },

    "Prednisolone": {
        class: "Corticosteroid",
        brandNames: "Prelone, Orapred, Millipred",
        administration: "Oral, Ophthalmic",
        halfLife: "2-4 hours",
        uses: "Prednisolone is used for inflammatory and allergic conditions, certain cancers, and autoimmune diseases.",
        dosage: "Dosage varies by condition. Range: 5-60 mg daily. Ophthalmic: 1-2 drops 2-4 times daily.",
        sideEffects: [
            "Increased intraocular pressure",
            "Cataract formation",
            "Delayed wound healing",
            "Peptic ulcer",
            "Moon face and buffalo hump"
        ],
        interactions: [
            { drug: "Anticoagulants", level: "medium", description: "May alter anticoagulant response" },
            { drug: "Anticholinesterases", level: "medium", description: "May worsen myasthenia gravis" }
        ],
        safety: "Use lowest effective dose for shortest duration. Taper gradually when discontinuing long-term therapy."
    },

    "Budesonide": {
        class: "Corticosteroid",
        brandNames: "Entocort EC, Pulmicort, Rhinocort",
        administration: "Oral, Inhalation, Nasal",
        halfLife: "2-3 hours",
        uses: "Budesonide is used for asthma, allergic rhinitis, Crohn's disease, and other inflammatory bowel diseases.",
        dosage: "Inhalation: 180-360 mcg twice daily. Nasal: 64 mcg per nostril daily. Crohn's: 9 mg daily for 8 weeks.",
        sideEffects: [
            "Oral candidiasis",
            "Hoarseness and throat irritation",
            "Headache",
            "Nasal irritation",
            "Cough and bronchospasm"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "medium", description: "May increase budesonide concentrations" },
            { drug: "CYP3A4 inhibitors", level: "medium", description: "May increase systemic exposure" }
        ],
        safety: "Rinse mouth after inhalation to prevent oral thrush. Use with caution in patients with tuberculosis or untreated infections."
    },

    "Beclomethasone": {
        class: "Corticosteroid",
        brandNames: "QVAR, Beconase",
        administration: "Inhalation, Nasal",
        halfLife: "2.8 hours",
        uses: "Beclomethasone is used for asthma maintenance treatment and allergic rhinitis.",
        dosage: "Inhalation: 40-320 mcg twice daily. Nasal: 1-2 sprays per nostril 2-4 times daily.",
        sideEffects: [
            "Nasal dryness and irritation",
            "Sneezing and epistaxis",
            "Headache",
            "Pharyngitis",
            "Unpleasant taste"
        ],
        interactions: [
            { drug: "Other inhaled corticosteroids", level: "medium", description: "Additive systemic effects" }
        ],
        safety: "Not for relief of acute bronchospasm. May take several days for full effect. Monitor growth in children."
    },

    "Ethinyl estradiol": {
        class: "Estrogen",
        brandNames: "Various combination oral contraceptives",
        administration: "Oral",
        halfLife: "6-20 hours",
        uses: "Ethinyl estradiol is used in combination oral contraceptives, hormone replacement therapy, and for menstrual disorders.",
        dosage: "In oral contraceptives: Typically 20-35 mcg daily. For hormone therapy: Individualized based on condition.",
        sideEffects: [
            "Nausea and vomiting",
            "Headache and migraine",
            "Breast tenderness",
            "Weight changes",
            "Mood changes",
            "Breakthrough bleeding"
        ],
        interactions: [
            { drug: "Anticonvulsants", level: "high", description: "May decrease contraceptive effectiveness" },
            { drug: "Antibiotics", level: "medium", description: "Some may reduce contraceptive efficacy" },
            { drug: "Smoking", level: "high", description: "Increased risk of cardiovascular events" }
        ],
        safety: "Contraindicated in women with history of thromboembolic disorders, certain cancers, or liver disease. Increased cardiovascular risk in smokers over 35."
    },

    "Levonorgestrel": {
        class: "Progestin",
        brandNames: "Plan B, Mirena, Skyla",
        administration: "Oral, Intrauterine device",
        halfLife: "26-45 hours",
        uses: "Levonorgestrel is used for emergency contraception, hormonal contraception, and hormone replacement therapy.",
        dosage: "Emergency contraception: 1.5 mg as single dose. IUD: Releases 20 mcg daily for up to 7 years.",
        sideEffects: [
            "Nausea and abdominal pain",
            "Fatigue and headache",
            "Breast tenderness",
            "Irregular bleeding",
            "Acne and weight changes"
        ],
        interactions: [
            { drug: "Enzyme inducers", level: "high", description: "May decrease contraceptive effectiveness" },
            { drug: "HIV protease inhibitors", level: "medium", description: "May alter contraceptive levels" }
        ],
        safety: "Emergency contraception is not for routine contraceptive use. IUD insertion requires trained healthcare provider."
    },

    "Drospirenone": {
        class: "Progestin",
        brandNames: "Yasmin, Yaz, Angeliq",
        administration: "Oral",
        halfLife: "30-40 hours",
        uses: "Drospirenone is used in combination oral contraceptives and for premenstrual dysphoric disorder.",
        dosage: "3 mg daily in combination with ethinyl estradiol for 24 days followed by 4 hormone-free days.",
        sideEffects: [
            "Hyperkalemia",
            "Headache",
            "Breast pain",
            "Menstrual irregularities",
            "Mood changes"
        ],
        interactions: [
            { drug: "ACE inhibitors", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "Potassium-sparing diuretics", level: "high", description: "Increased risk of hyperkalemia" },
            { drug: "NSAIDs", level: "medium", description: "May increase potassium levels" }
        ],
        safety: "Contraindicated in renal impairment, adrenal insufficiency, or hepatic dysfunction. Monitor potassium levels in high-risk patients."
    },

    "Norgestimate": {
        class: "Progestin",
        brandNames: "Ortho Tri-Cyclen, Sprintec",
        administration: "Oral",
        halfLife: "12-30 hours",
        uses: "Norgestimate is used in combination oral contraceptives and for acne treatment in women.",
        dosage: "Typically 0.18-0.25 mg daily in combination with ethinyl estradiol in multiphasic regimens.",
        sideEffects: [
            "Nausea",
            "Headache",
            "Breast tenderness",
            "Weight changes",
            "Mood changes"
        ],
        interactions: [
            { drug: "Carbamazepine", level: "high", description: "May decrease contraceptive effectiveness" },
            { drug: "Rifampin", level: "high", description: "May decrease contraceptive effectiveness" }
        ],
        safety: "May increase risk of thromboembolic events. Use with caution in women with cardiovascular risk factors."
    },

    "Desogestrel": {
        class: "Progestin",
        brandNames: "Cerazette, Marvelon, Cyclessa",
        administration: "Oral",
        halfLife: "38±20 hours",
        uses: "Desogestrel is used in combination oral contraceptives and as progestin-only contraceptive.",
        dosage: "Progestin-only: 75 mcg daily. Combination: 0.15 mg daily with ethinyl estradiol.",
        sideEffects: [
            "Irregular bleeding",
            "Headache",
            "Nausea",
            "Breast tenderness",
            "Mood changes"
        ],
        interactions: [
            { drug: "Enzyme-inducing drugs", level: "high", description: "May decrease contraceptive effectiveness" }
        ],
        safety: "Progestin-only pills must be taken at the same time daily for maximum effectiveness. Higher risk of ectopic pregnancy if failure occurs."
    },

    "Etonogestrel": {
        class: "Progestin",
        brandNames: "Nexplanon, Implanon",
        administration: "Subdermal implant",
        halfLife: "25 hours",
        uses: "Etonogestrel is used for long-term contraception via subdermal implant.",
        dosage: "68 mg implant providing contraception for up to 3 years.",
        sideEffects: [
            "Irregular bleeding patterns",
            "Headache",
            "Weight gain",
            "Acne",
            "Breast pain",
            "Mood changes"
        ],
        interactions: [
            { drug: "Enzyme inducers", level: "high", description: "May decrease contraceptive effectiveness" }
        ],
        safety: "Insertion and removal require trained healthcare provider. Not suitable for women with active liver disease or unexplained vaginal bleeding."
    },

    "Medroxyprogesterone": {
        class: "Progestin",
        brandNames: "Provera, Depo-Provera",
        administration: "Oral, Injection",
        halfLife: "12-17 hours (oral), 50 days (injection)",
        uses: "Medroxyprogesterone is used for contraception, menstrual disorders, and endometrial protection in hormone therapy.",
        dosage: "Contraception: 150 mg IM every 3 months. Menstrual disorders: 5-10 mg daily for 5-10 days.",
        sideEffects: [
            "Weight gain",
            "Menstrual irregularities",
            "Headache",
            "Mood changes",
            "Bone density loss with long-term use"
        ],
        interactions: [
            { drug: "Aminoglutethimide", level: "medium", description: "May decrease medroxyprogesterone levels" }
        ],
        safety: "Long-term use may cause bone mineral density loss. Return to fertility may be delayed after discontinuation."
    },

    "Norelgestromin": {
        class: "Progestin",
        brandNames: "Ortho Evra",
        administration: "Transdermal patch",
        halfLife: "28 hours",
        uses: "Norelgestromin is used in combination contraceptive patch.",
        dosage: "Patch delivering 150 mcg norelgestromin and 20 mcg ethinyl estradiol daily, changed weekly.",
        sideEffects: [
            "Application site reactions",
            "Breast tenderness",
            "Headache",
            "Nausea",
            "Menstrual cramps"
        ],
        interactions: [
            { drug: "Enzyme inducers", level: "high", description: "May decrease contraceptive effectiveness" }
        ],
        safety: "Higher estrogen exposure compared to oral contraceptives. May have increased risk of thromboembolic events."
    },

    "Ulipristal acetate": {
        class: "Selective Progesterone Receptor Modulator",
        brandNames: "Ella, Fibristal",
        administration: "Oral",
        halfLife: "32-38 hours",
        uses: "Ulipristal acetate is used for emergency contraception and treatment of uterine fibroids.",
        dosage: "Emergency contraception: 30 mg single dose. Uterine fibroids: 5 mg daily for 3 months.",
        sideEffects: [
            "Headache",
            "Nausea",
            "Abdominal pain",
            "Dizziness",
            "Menstrual changes"
        ],
        interactions: [
            { drug: "Enzyme inducers", level: "high", description: "May decrease effectiveness" },
            { drug: "Antacids", level: "medium", description: "Take 2 hours apart" }
        ],
        safety: "Not for routine contraception. Liver function monitoring required during fibroid treatment."
    },

    "Mifepristone": {
        class: "Antiprogestin",
        brandNames: "Mifeprex, Korlym",
        administration: "Oral",
        halfLife: "18-85 hours",
        uses: "Mifepristone is used for medical abortion and treatment of Cushing's syndrome.",
        dosage: "Medical abortion: 200 mg single dose with misoprostol. Cushing's: 300 mg once daily.",
        sideEffects: [
            "Vaginal bleeding and cramping",
            "Nausea and vomiting",
            "Headache",
            "Dizziness",
            "Fatigue"
        ],
        interactions: [
            { drug: "CYP3A4 inhibitors", level: "high", description: "May increase mifepristone levels" },
            { drug: "CYP3A4 substrates", level: "high", description: "Mifepristone may increase their levels" }
        ],
        safety: "Medical abortion requires medical supervision and follow-up. Not for ectopic pregnancy. Risk of serious infections."
    },

    "Dienogest": {
        class: "Progestin",
        brandNames: "Natazia, Visanne",
        administration: "Oral",
        halfLife: "9-10 hours",
        uses: "Dienogest is used for contraception and treatment of endometriosis.",
        dosage: "Contraception: 2-3 mg daily in combination regimen. Endometriosis: 2 mg daily.",
        sideEffects: [
            "Headache",
            "Breast pain",
            "Nausea",
            "Depressed mood",
            "Acne"
        ],
        interactions: [
            { drug: "Enzyme inducers", level: "high", description: "May decrease effectiveness" }
        ],
        safety: "Use with caution in women with history of depression. Monitor liver function during long-term use."
    },

    "Norgestrel": {
        class: "Progestin",
        brandNames: "Ovrette, Opill",
        administration: "Oral",
        halfLife: "12-20 hours",
        uses: "Norgestrel is used in progestin-only contraceptives and combination oral contraceptives.",
        dosage: "Progestin-only: 0.075 mg daily. Combination: 0.3-0.5 mg daily with estrogen.",
        sideEffects: [
            "Irregular menstrual bleeding",
            "Headache",
            "Nausea",
            "Breast tenderness",
            "Weight changes"
        ],
        interactions: [
            { drug: "Enzyme-inducing drugs", level: "high", description: "May decrease contraceptive effectiveness" }
        ],
        safety: "Must be taken at the same time daily for maximum effectiveness. Higher failure rate than combination oral contraceptives."
    },
    "Omeprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Prilosec, Losec, Zegerid",
        administration: "Oral",
        halfLife: "0.5-1 hour",
        uses: "Omeprazole is used to treat gastroesophageal reflux disease (GERD), stomach ulcers, erosive esophagitis, and conditions where the stomach produces too much acid.",
        dosage: "For GERD: 20 mg once daily for 4-8 weeks. For ulcer treatment: 20-40 mg daily. For Zollinger-Ellison syndrome: 60 mg daily. Take before meals.",
        sideEffects: [
            "Headache",
            "Abdominal pain",
            "Nausea",
            "Diarrhea",
            "Vomiting",
            "Flatulence",
            "Constipation"
        ],
        interactions: [
            { drug: "Clopidogrel", level: "high", description: "May reduce antiplatelet effect" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Diazepam", level: "medium", description: "May increase diazepam levels" },
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" }
        ],
        safety: "Long-term use may be associated with increased risk of fractures, hypomagnesemia, vitamin B12 deficiency, and kidney disease. Use lowest effective dose for shortest duration."
    },
    "Esomeprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Nexium, Esotrex",
        administration: "Oral, IV",
        halfLife: "1-1.5 hours",
        uses: "Esomeprazole is used to treat GERD, erosive esophagitis, Helicobacter pylori infection, and pathological hypersecretory conditions including Zollinger-Ellison syndrome.",
        dosage: "For GERD: 20-40 mg once daily for 4-8 weeks. For H. pylori eradication: 40 mg once daily with antibiotics. Take at least 1 hour before meals.",
        sideEffects: [
            "Headache",
            "Diarrhea",
            "Nausea",
            "Flatulence",
            "Abdominal pain",
            "Constipation",
            "Dry mouth"
        ],
        interactions: [
            { drug: "Clopidogrel", level: "high", description: "May reduce antiplatelet effect" },
            { drug: "Methotrexate", level: "high", description: "May increase methotrexate toxicity" },
            { drug: "Cilostazol", level: "medium", description: "May increase cilostazol levels" },
            { drug: "St. John's wort", level: "medium", description: "May decrease esomeprazole levels" }
        ],
        safety: "May increase risk of bone fractures with long-term use. Monitor magnesium levels periodically. Not recommended during pregnancy unless clearly needed."
    },
    "Pantoprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Protonix, Pantoloc, Somac",
        administration: "Oral, IV",
        halfLife: "1 hour",
        uses: "Pantoprazole is used for treatment and maintenance of erosive esophagitis, GERD, Zollinger-Ellison syndrome, and gastric ulcers associated with NSAID use.",
        dosage: "For GERD: 40 mg once daily for up to 8 weeks. For maintenance: 40 mg once daily. For Zollinger-Ellison: 40 mg twice daily, may increase to 240 mg daily.",
        sideEffects: [
            "Headache",
            "Diarrhea",
            "Nausea",
            "Abdominal pain",
            "Flatulence",
            "Dizziness",
            "Rash"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" },
            { drug: "Atazanavir", level: "medium", description: "May reduce antiretroviral efficacy" }
        ],
        safety: "Long-term use may lead to vitamin B12 deficiency, hypomagnesemia, and increased risk of fractures. Discontinue as soon as appropriate."
    },
    "Lansoprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Prevacid, Zoton, Inhibitol",
        administration: "Oral",
        halfLife: "1.5 hours",
        uses: "Lansoprazole is used to treat and prevent stomach and intestinal ulcers, erosive esophagitis, GERD, and Zollinger-Ellison syndrome.",
        dosage: "For GERD: 15-30 mg once daily for up to 8 weeks. For ulcer treatment: 15-30 mg daily. For H. pylori: 30 mg twice daily with antibiotics.",
        sideEffects: [
            "Diarrhea",
            "Abdominal pain",
            "Nausea",
            "Headache",
            "Constipation",
            "Rash",
            "Dizziness"
        ],
        interactions: [
            { drug: "Theophylline", level: "medium", description: "May slightly increase theophylline clearance" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" }
        ],
        safety: "May increase risk of C. difficile-associated diarrhea. Long-term use associated with hypomagnesemia and vitamin B12 deficiency."
    },
    "Rabeprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Aciphex, Pariet, Rabeloc",
        administration: "Oral",
        halfLife: "1-2 hours",
        uses: "Rabeprazole is used for healing and maintenance of erosive GERD, treatment of duodenal ulcers, H. pylori eradication, and treatment of hypersecretory conditions.",
        dosage: "For GERD: 20 mg once daily for 4-8 weeks. For maintenance: 20 mg once daily. For ulcers: 20 mg once daily. Take before meals.",
        sideEffects: [
            "Headache",
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Constipation",
            "Abdominal pain",
            "Flatulence"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" },
            { drug: "Digoxin", level: "medium", description: "May increase digoxin levels" },
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" }
        ],
        safety: "Long-term use may lead to hypomagnesemia, vitamin B12 deficiency, and increased fracture risk. Use shortest duration appropriate for condition."
    },
    "Famotidine": {
        class: "H2 Receptor Antagonist",
        brandNames: "Pepcid, Pepcidine, Fluxid",
        administration: "Oral, IV",
        halfLife: "2.5-3.5 hours",
        uses: "Famotidine is used to treat and prevent ulcers, gastroesophageal reflux disease (GERD), and conditions where the stomach produces too much acid.",
        dosage: "For ulcer treatment: 20-40 mg at bedtime. For GERD: 20 mg twice daily. For heartburn: 10-20 mg as needed. Maximum 40 mg twice daily.",
        sideEffects: [
            "Headache",
            "Dizziness",
            "Constipation",
            "Diarrhea",
            "Fatigue",
            "Dry mouth",
            "Rash"
        ],
        interactions: [
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" },
            { drug: "Itraconazole", level: "medium", description: "May reduce absorption" },
            { drug: "Atazanavir", level: "medium", description: "May reduce antiretroviral efficacy" }
        ],
        safety: "Dosage adjustment needed in renal impairment. May cause false-positive urine protein tests. Generally well-tolerated with few drug interactions."
    },
    "Ranitidine": {
        class: "H2 Receptor Antagonist",
        brandNames: "Zantac, Tritec, Raniberl",
        administration: "Oral, IV",
        halfLife: "2-3 hours",
        uses: "Ranitidine is used to treat and prevent ulcers, GERD, Zollinger-Ellison syndrome, and other conditions involving excessive stomach acid production.",
        dosage: "For ulcer treatment: 150 mg twice daily or 300 mg at bedtime. For GERD: 150 mg twice daily. For maintenance: 150 mg at bedtime.",
        sideEffects: [
            "Headache",
            "Constipation",
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Abdominal discomfort",
            "Dizziness"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Triazolam", level: "medium", description: "May increase triazolam levels" },
            { drug: "Glipizide", level: "low", description: "May increase hypoglycemic effect" }
        ],
        safety: "NOTE: Many ranitidine products were recalled due to NDMA contamination. Consult healthcare provider for alternatives. Use with caution in elderly patients."
    },
    "Cimetidine": {
        class: "H2 Receptor Antagonist",
        brandNames: "Tagamet, Cimet, Ulcedine",
        administration: "Oral, IV",
        halfLife: "2 hours",
        uses: "Cimetidine is used for short-term treatment of duodenal ulcers, GERD, and pathological hypersecretory conditions. Also used to prevent upper GI bleeding.",
        dosage: "For ulcer treatment: 300 mg four times daily or 400-800 mg twice daily. For GERD: 400 mg four times daily. Maximum 2400 mg daily.",
        sideEffects: [
            "Diarrhea",
            "Dizziness",
            "Headache",
            "Gynecomastia",
            "Impotence",
            "Confusion (especially in elderly)",
            "Rash"
        ],
        interactions: [
            { drug: "Warfarin", level: "high", description: "Significantly increases anticoagulant effect" },
            { drug: "Theophylline", level: "high", description: "Increases theophylline levels" },
            { drug: "Phenytoin", level: "high", description: "Increases phenytoin levels" },
            { drug: "Benzodiazepines", level: "medium", description: "May increase sedative effects" }
        ],
        safety: "Has significant drug interactions due to CYP450 inhibition. Use with caution in elderly patients due to CNS effects. May cause gynecomastia with long-term use."
    },
    "Sucralfate": {
        class: "Gastroprotective Agent",
        brandNames: "Carafate, Sucramal, Antepsin",
        administration: "Oral",
        halfLife: "6-20 hours",
        uses: "Sucralfate is used for short-term treatment of duodenal ulcers and maintenance therapy. It forms a protective coating over ulcers to promote healing.",
        dosage: "1 gram four times daily on empty stomach (1 hour before meals and at bedtime). For maintenance: 1 gram twice daily.",
        sideEffects: [
            "Constipation",
            "Dry mouth",
            "Nausea",
            "Indigestion",
            "Diarrhea",
            "Dizziness",
            "Back pain"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May decrease absorption" },
            { drug: "Digoxin", level: "medium", description: "May decrease absorption" },
            { drug: "Quinolones", level: "medium", description: "May decrease absorption" },
            { drug: "Thyroid hormones", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Take on empty stomach for maximum effectiveness. Separate from other medications by at least 2 hours. Use with caution in renal impairment due to aluminum content."
    },
    "Misoprostol": {
        class: "Prostaglandin Analog",
        brandNames: "Cytotec, Arthrotec (with diclofenac)",
        administration: "Oral",
        halfLife: "20-40 minutes",
        uses: "Misoprostol is used to prevent NSAID-induced gastric ulcers, medical abortion (with mifepristone), and for cervical ripening before surgical procedures.",
        dosage: "For ulcer prevention: 200 mcg four times daily with food. For abortion: 800 mcg vaginally. Take with food to reduce diarrhea.",
        sideEffects: [
            "Diarrhea",
            "Abdominal pain",
            "Nausea",
            "Flatulence",
            "Headache",
            "Dyspepsia",
            "Vomiting"
        ],
        interactions: [
            { drug: "Magnesium-containing antacids", level: "medium", description: "May increase diarrhea" },
            { drug: "NSAIDs", level: "low", description: "Used to prevent their ulcerogenic effects" }
        ],
        safety: "ABSOLUTELY CONTRANDICATED IN PREGNANCY due to abortifacient properties. May cause miscarriage, birth defects, or premature birth. Must use effective contraception."
    },
    "Sodium bicarbonate": {
        class: "Antacid",
        brandNames: "Baking soda, Alka-Seltzer, Bell-ans",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Sodium bicarbonate is used for temporary relief of heartburn, acid indigestion, and sour stomach. Also used to treat metabolic acidosis and as a urinary alkalinizer.",
        dosage: "For heartburn: 1/2 teaspoon in glass of water every 2 hours as needed. Maximum 4 teaspoons in 24 hours. Not for prolonged use.",
        sideEffects: [
            "Belching",
            "Flatulence",
            "Stomach cramps",
            "Increased thirst",
            "Alkalosis with excessive use",
            "Swelling of feet/ankles",
            "Weight gain"
        ],
        interactions: [
            { drug: "Aspirin", level: "medium", description: "May increase aspirin excretion" },
            { drug: "Lithium", level: "medium", description: "May decrease lithium levels" },
            { drug: "Methenamine", level: "medium", description: "May decrease effectiveness" },
            { drug: "Quinolones", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Contraindicated in patients on sodium-restricted diets. Use with caution in heart failure, renal impairment, or hypertension. May cause metabolic alkalosis."
    },
    "Aluminum hydroxide": {
        class: "Antacid",
        brandNames: "AlternaGEL, Amphojel, Alu-Cap",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Aluminum hydroxide is used for symptomatic relief of heartburn, acid indigestion, and sour stomach. Also used to control hyperphosphatemia in renal failure.",
        dosage: "For heartburn: 500-1500 mg 3-6 times daily between meals and at bedtime. For hyperphosphatemia: 300-600 mg three times daily with meals.",
        sideEffects: [
            "Constipation",
            "Nausea",
            "Vomiting",
            "Stomach cramps",
            "Loss of appetite",
            "Chalky taste",
            "Hypophosphatemia"
        ],
        interactions: [
            { drug: "Tetracyclines", level: "high", description: "Significantly decreases absorption" },
            { drug: "Quinolones", level: "high", description: "Significantly decreases absorption" },
            { drug: "Iron supplements", level: "medium", description: "Decreases iron absorption" },
            { drug: "Digoxin", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Use with caution in renal impairment due to risk of aluminum accumulation. May cause constipation. Separate from other medications by 2-4 hours."
    },
    "Magnesium hydroxide": {
        class: "Antacid, Saline Laxative",
        brandNames: "Milk of Magnesia, Phillips' Milk of Magnesia",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Magnesium hydroxide is used as an antacid for heartburn and indigestion, and as a laxative for occasional constipation.",
        dosage: "As antacid: 5-15 ml as needed up to 4 times daily. As laxative: 30-60 ml at bedtime. Maximum 60 ml in 24 hours.",
        sideEffects: [
            "Diarrhea",
            "Stomach cramps",
            "Nausea",
            "Vomiting",
            "Weakness",
            "Dizziness",
            "Flushing"
        ],
        interactions: [
            { drug: "Quinolones", level: "high", description: "Decreases absorption" },
            { drug: "Tetracyclines", level: "high", description: "Decreases absorption" },
            { drug: "Bisphosphonates", level: "medium", description: "Decreases absorption" },
            { drug: "Digoxin", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Contraindicated in renal impairment due to risk of hypermagnesemia. Use with caution in patients with abdominal pain, nausea, or vomiting. Not for prolonged use."
    },
    "Dexlansoprazole": {
        class: "Proton Pump Inhibitor (PPI)",
        brandNames: "Dexilant, Kapidex",
        administration: "Oral",
        halfLife: "1-2 hours",
        uses: "Dexlansoprazole is used for healing and maintenance of erosive esophagitis, treatment of non-erosive GERD, and relief of heartburn.",
        dosage: "For erosive esophagitis: 60 mg once daily for up to 8 weeks. For maintenance: 30 mg once daily. For GERD: 30 mg once daily for 4 weeks.",
        sideEffects: [
            "Diarrhea",
            "Abdominal pain",
            "Nausea",
            "Upper respiratory infection",
            "Vomiting",
            "Flatulence",
            "Headache"
        ],
        interactions: [
            { drug: "Warfarin", level: "medium", description: "May increase anticoagulant effect" },
            { drug: "Ketoconazole", level: "medium", description: "May reduce absorption" },
            { drug: "Atazanavir", level: "medium", description: "May reduce antiretroviral efficacy" }
        ],
        safety: "Long-term use may increase risk of fractures, hypomagnesemia, and vitamin B12 deficiency. Use lowest effective dose for shortest duration appropriate."
    },
    "Bisacodyl": {
        class: "Stimulant Laxative",
        brandNames: "Dulcolax, Correctol, Feen-a-mint",
        administration: "Oral, Rectal",
        halfLife: "16 hours",
        uses: "Bisacodyl is used for the relief of occasional constipation and for bowel cleansing before diagnostic procedures or surgery.",
        dosage: "Oral: 5-15 mg once daily, preferably at bedtime. Rectal: 10 mg suppository once daily. Not for use longer than 7 days.",
        sideEffects: [
            "Abdominal cramping",
            "Nausea",
            "Diarrhea",
            "Rectal burning",
            "Weakness",
            "Dizziness",
            "Electrolyte imbalance"
        ],
        interactions: [
            { drug: "Antacids", level: "medium", description: "May cause premature dissolution of enteric coating" },
            { drug: "Milk", level: "low", description: "May cause premature dissolution of enteric coating" },
            { drug: "Diuretics", level: "low", description: "Increased risk of electrolyte imbalance" }
        ],
        safety: "Do not chew or crush tablets. Do not use within 1 hour of antacids or milk. Prolonged use may lead to laxative dependence and electrolyte disturbances."
    },
    "Senna": {
        class: "Stimulant Laxative",
        brandNames: "Senokot, Ex-Lax, Perdiem",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Senna is used for the relief of occasional constipation and for bowel cleansing before diagnostic procedures. Often used in combination with other laxatives.",
        dosage: "Adults: 2 tablets (8.6 mg each) once daily, preferably at bedtime. Maximum 4 tablets twice daily. Not for use longer than 7 days.",
        sideEffects: [
            "Abdominal cramping",
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Urine discoloration (pink-red-brown)",
            "Electrolyte imbalance",
            "Weakness"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "Hypokalemia may increase digoxin toxicity" },
            { drug: "Diuretics", level: "medium", description: "Increased risk of electrolyte imbalance" },
            { drug: "Corticosteroids", level: "low", description: "Increased risk of hypokalemia" }
        ],
        safety: "Prolonged use may lead to laxative dependence, cathartic colon, and electrolyte disturbances. Urine discoloration is harmless. Not for abdominal pain use."
    },
    "Lactulose": {
        class: "Osmotic Laxative",
        brandNames: "Chronulac, Duphalac, Enulose",
        administration: "Oral, Rectal",
        halfLife: "N/A",
        uses: "Lactulose is used for the treatment of constipation and for the prevention and treatment of hepatic encephalopathy (portal-systemic encephalopathy).",
        dosage: "For constipation: 15-30 ml daily, adjust to 2-3 soft stools daily. For hepatic encephalopathy: 30-45 ml 3-4 times daily initially.",
        sideEffects: [
            "Diarrhea",
            "Abdominal cramping",
            "Flatulence",
            "Nausea",
            "Vomiting",
            "Electrolyte imbalance",
            "Dehydration"
        ],
        interactions: [
            { drug: "Non-absorbable antacids", level: "medium", description: "May reduce lactulose effectiveness" },
            { drug: "Other laxatives", level: "low", description: "May cause excessive bowel activity" }
        ],
        safety: "Use with caution in diabetics due to carbohydrate content. May require several days for full effect in constipation. Monitor electrolytes with prolonged use."
    },
    "Polyethylene glycol": {
        class: "Osmotic Laxative",
        brandNames: "Miralax, GlycoLax, ClearLax",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Polyethylene glycol is used for the treatment of occasional constipation and for bowel cleansing before colonoscopy or other medical procedures.",
        dosage: "For constipation: 17 grams (1 capful or packet) dissolved in 4-8 oz of liquid once daily. For bowel prep: as directed for specific product.",
        sideEffects: [
            "Nausea",
            "Abdominal cramping",
            "Bloating",
            "Flatulence",
            "Diarrhea",
            "Dizziness",
            "Anal irritation"
        ],
        interactions: [
            { drug: "Oral medications", level: "medium", description: "May decrease absorption of other oral drugs" },
            { drug: "Diuretics", level: "low", description: "Increased risk of electrolyte imbalance" }
        ],
        safety: "Use with caution in patients with impaired gag reflex or prone to regurgitation. Ensure adequate fluid intake. Not for use longer than 2 weeks without medical advice."
    },
    "Magnesium citrate": {
        class: "Saline Laxative",
        brandNames: "Citroma, Citro-Mag",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Magnesium citrate is used for rapid evacuation of the bowel for constipation relief and for bowel cleansing before diagnostic procedures.",
        dosage: "1 full bottle (usually 296 ml) as a single dose. May follow with full glass of water. Usually produces bowel movement in 30 minutes to 3 hours.",
        sideEffects: [
            "Abdominal cramping",
            "Diarrhea",
            "Nausea",
            "Vomiting",
            "Electrolyte imbalance",
            "Dehydration",
            "Weakness"
        ],
        interactions: [
            { drug: "Digoxin", level: "medium", description: "Hypokalemia may increase digoxin toxicity" },
            { drug: "Neuromuscular blockers", level: "medium", description: "May enhance neuromuscular blockade" },
            { drug: "Quinolones", level: "medium", description: "Decreases absorption" }
        ],
        safety: "CONTRAINDICATED in renal impairment due to risk of hypermagnesemia. Use with caution in patients with electrolyte disturbances or heart conditions."
    },
    "Docusate sodium": {
        class: "Stool Softener",
        brandNames: "Colace, Doxidan, Surfak",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Docusate sodium is used to treat and prevent constipation by softening stools, making them easier to pass. Often used when straining should be avoided.",
        dosage: "Adults: 50-500 mg daily in 1-4 divided doses. Usually produces effect in 1-3 days. Maximum 500 mg daily.",
        sideEffects: [
            "Mild abdominal cramping",
            "Throat irritation (liquid form)",
            "Rash",
            "Diarrhea",
            "Bitter taste",
            "Nausea"
        ],
        interactions: [
            { drug: "Mineral oil", level: "medium", description: "May increase mineral oil absorption" },
            { drug: "Other laxatives", level: "low", description: "May enhance effects" }
        ],
        safety: "Generally considered safe for short-term use. Takes 1-3 days to work. Ensure adequate fluid intake. Not for abdominal pain, nausea, or vomiting."
    },
    "Psyllium": {
        class: "Bulk-forming Laxative",
        brandNames: "Metamucil, Konsyl, Fiberall",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Psyllium is used to treat constipation and to help maintain regular bowel movements. Also used as a fiber supplement and for cholesterol reduction.",
        dosage: "1 teaspoon (or 1 packet) 1-3 times daily mixed with at least 8 oz of fluid. Maximum 3 doses daily. Drink plenty of fluids.",
        sideEffects: [
            "Abdominal cramping",
            "Bloating",
            "Gas",
            "Allergic reactions",
            "Difficulty swallowing",
            "Esophageal obstruction"
        ],
        interactions: [
            { drug: "Carbamazepine", level: "medium", description: "May decrease absorption" },
            { drug: "Warfarin", level: "medium", description: "May decrease absorption" },
            { drug: "Digoxin", level: "medium", description: "May decrease absorption" },
            { drug: "Lithium", level: "medium", description: "May decrease absorption" }
        ],
        safety: "Take with plenty of water to prevent esophageal obstruction or choking. Separate from other medications by at least 2 hours. May cause allergic reactions in sensitive individuals."
    },
    "Sorbitol": {
        class: "Osmotic Laxative",
        brandNames: "Various generic products",
        administration: "Oral",
        halfLife: "N/A",
        uses: "Sorbitol is used as a sweetener in sugar-free products and as an osmotic laxative for the relief of occasional constipation.",
        dosage: "As laxative: 30-150 ml of 70% solution as a single dose. Adjust based on response. Usually produces effect within 30 minutes to 3 hours.",
        sideEffects: [
            "Abdominal cramping",
            "Diarrhea",
            "Flatulence",
            "Nausea",
            "Vomiting",
            "Dehydration",
            "Electrolyte imbalance"
        ],
        interactions: [
            { drug: "Sodium polystyrene sulfonate", level: "high", description: "May cause intestinal necrosis" },
            { drug: "Other laxatives", level: "medium", description: "May cause excessive bowel activity" }
        ],
        safety: "Use with caution in diabetics as it contains calories. May cause gastrointestinal distress with excessive consumption. Not for prolonged use."
    },
    "Glycerin suppository": {
        class: "Hyperosmotic Laxative",
        brandNames: "Fleet Glycerin Suppositories, Sani-Supp",
        administration: "Rectal",
        halfLife: "N/A",
        uses: "Glycerin suppositories are used for the relief of occasional constipation, particularly when oral laxatives are not appropriate or for rapid relief.",
        dosage: "Adults and children over 6 years: 1 suppository (usually 2-3 grams) inserted rectally once daily as needed. Usually produces effect within 15-60 minutes.",
        sideEffects: [
            "Rectal irritation",
            "Burning sensation",
            "Cramping",
            "Diarrhea",
            "Nausea",
            "Weakness"
        ],
        interactions: [
            { drug: "None significant", level: "low", description: "Minimal systemic absorption" }
        ],
        safety: "For rectal use only. Do not use if suppository is softened. Not for prolonged use. Discontinue if severe rectal irritation occurs. Usually produces bowel movement within 1 hour."
    }
};

// DOM elements
const drugTags = document.querySelectorAll('.drug-tag');
const modalOverlay = document.getElementById('drugModal');
const closeModalBtn = document.getElementById('closeModal');
const modalDrugName = document.getElementById('modalDrugName');

// Event listeners for drug tags
drugTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const drugName = tag.getAttribute('data-drug');
        showDrugInfo(drugName);
    });
});

// Close modal events
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Function to show drug information
function showDrugInfo(drugName) {
    const drug = drugDatabase[drugName];
    
    if (!drug) {
        // For drugs not in our detailed database, show a generic message
        modalDrugName.textContent = drugName;
        document.getElementById('drugClass').textContent = "Information not available";
        document.getElementById('brandNames').textContent = "N/A";
        document.getElementById('administration').textContent = "N/A";
        document.getElementById('halfLife').textContent = "N/A";
        document.getElementById('drugUses').textContent = "Detailed information for this medication is not currently available in our database.";
        document.getElementById('dosageInfo').textContent = "Please consult your healthcare provider or pharmacist for dosage information.";
        document.getElementById('safetyInfo').textContent = "Always follow your healthcare provider's instructions and read the medication guide provided with your prescription.";

        // Clear lists
        document.getElementById('sideEffects').innerHTML = '<li>Information not available</li>';
        document.getElementById('drugInteractions').innerHTML = '<li>Information not available</li>';
    } else {
        // Set basic drug information
        modalDrugName.textContent = drugName;
        document.getElementById('drugClass').textContent = drug.class;
        document.getElementById('brandNames').textContent = drug.brandNames;
        document.getElementById('administration').textContent = drug.administration;
        document.getElementById('halfLife').textContent = drug.halfLife;
        document.getElementById('drugUses').textContent = drug.uses;
        document.getElementById('dosageInfo').textContent = drug.dosage;
        document.getElementById('safetyInfo').textContent = drug.safety;

        // Populate side effects
        const sideEffectsList = document.getElementById('sideEffects');
        sideEffectsList.innerHTML = '';
        drug.sideEffects.forEach(effect => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-chevron-right" style="color: #0066cc; margin-right: 10px;"></i> ${effect}`;
            sideEffectsList.appendChild(li);
        });

        // Populate drug interactions
        const interactionsList = document.getElementById('drugInteractions');
        interactionsList.innerHTML = '';
        drug.interactions.forEach(interaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <span><strong>${interaction.drug}</strong> - ${interaction.description}</span>
                    <span class="interaction-level level-${interaction.level}">${interaction.level.toUpperCase()}</span>
                </div>
            `;
            interactionsList.appendChild(li);
        });
    }

    // Show the modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Search functionality
const searchInput = document.getElementById('drugSearch');
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const allDrugTags = document.querySelectorAll('.drug-tag');
    let visibleCount = 0;
    
    allDrugTags.forEach(tag => {
        const drugName = tag.getAttribute('data-drug').toLowerCase();
        if (drugName.includes(searchTerm)) {
            tag.style.display = 'inline-block';
            visibleCount++;
        } else {
            tag.style.display = 'none';
        }
    });
    
    // Show/hide category sections based on visible drugs
    const categorySections = document.querySelectorAll('.drug-category-section');
    categorySections.forEach(section => {
        const tagsInSection = section.querySelectorAll('.drug-tag');
        const visibleTags = Array.from(tagsInSection).filter(tag => 
            tag.style.display !== 'none'
        );
        
        if (visibleTags.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Add hover effect to category cards
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Improved smooth scroll with offset
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const yOffset = -140;
            const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    });
});


// Scroll to Top Button Logic
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
});

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.category-section').forEach(s => s.classList.remove('active-section'));
    // Remove active class from buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    // Show selected section
    document.getElementById(sectionId).classList.add('active-section');
    // Activate related button
    event.target.classList.add('active');
}

