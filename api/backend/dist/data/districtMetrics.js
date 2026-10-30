"use strict";
// Precomputed Official AP Police District Metrics
// Sourced from State Crime Incident Data 2021-2023
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistrictMetrics = exports.DISTRICT_METRICS = exports.STATE_METRICS = exports.normalizeDistrictName = exports.DISTRICT_ALIASES = void 0;
exports.DISTRICT_ALIASES = {
    'vishakapatnam': 'Visakhapatnam',
    'vishakapatnam city': 'Visakhapatnam',
    'visakhapatnam': 'Visakhapatnam',
    'ntr': 'NTR (Vijayawada)',
    'ntr (vijayawada)': 'NTR (Vijayawada)',
    'vijayawada': 'NTR (Vijayawada)',
    'vijayawada city': 'NTR (Vijayawada)',
    'guntur': 'Guntur',
    'guntur(r)': 'Guntur',
    'guntur(u)': 'Guntur',
    'tirupati': 'Tirupati',
    'tirupathi': 'Tirupati',
    'tirupathi(u)': 'Tirupati',
    'kurnool': 'Kurnool',
    'sps nellore': 'SPS Nellore',
    's.p.s.r nellore': 'SPS Nellore',
    'nellore': 'SPS Nellore',
    'kakinada': 'Kakinada',
    'east godavari': 'East Godavari',
    'west godavari': 'West Godavari',
    'ysr': 'YSR Kadapa',
    'y.s.r': 'YSR Kadapa',
    'ysr kadapa': 'YSR Kadapa',
    'kadapa': 'YSR Kadapa',
    'anantapur': 'Anantapur',
    'ananthapuramu': 'Anantapur',
    'ananthpuramu': 'Anantapur',
    'krishna': 'Krishna',
    'krsihna': 'Krishna',
    'chittoor': 'Chittoor',
    'chittor': 'Chittoor',
    'srikakulam': 'Srikakulam',
    'vizianagaram': 'Vizianagaram',
    'bapatla': 'Bapatla',
    'palnadu': 'Palnadu',
    'prakasam': 'Prakasam',
    'nandyal': 'Nandyal',
    'eluru': 'Eluru',
    'anakapalli': 'Anakapalli',
    'annamayya': 'Annamayya',
    'sri sathya sai': 'Sri Sathya Sai',
    'dr.b.r.ambedkar konaseema': 'Dr.B.R.Ambedkar Konaseema',
    'konaseema': 'Dr.B.R.Ambedkar Konaseema',
    'parvathipuram manyam': 'Parvathipuram Manyam',
    'alluri sitharama raju': 'Alluri Sitharama Raju',
    'rajamahendravaram': 'Rajamahendravaram',
    'vijayawada railway': 'Vijayawada Railway',
    'guntakal railway': 'Guntakal Railway'
};
const normalizeDistrictName = (name) => {
    if (!name || name === 'ALL' || name.toLowerCase() === 'all' || name.toLowerCase() === 'all districts')
        return null;
    const clean = name.trim().toLowerCase();
    return exports.DISTRICT_ALIASES[clean] || Object.values(exports.DISTRICT_ALIASES).find(d => d.toLowerCase() === clean) || name.trim();
};
exports.normalizeDistrictName = normalizeDistrictName;
exports.STATE_METRICS = {
    "district": "All Andhra Pradesh",
    "totalRecords": 492025,
    "topCategory": "Other Crimes",
    "topCategoryCount": 339002,
    "topCategoryPercentage": 68.9,
    "topDistrict": "Guntur",
    "topDistrictCount": 37273,
    "safetyRatio": 98.4,
    "categories": [
        {
            "category": "Other Crimes",
            "count": 339002,
            "percentage": 68.9
        },
        {
            "category": "Other IPC Crimes",
            "count": 54028,
            "percentage": 11
        },
        {
            "category": "Theft",
            "count": 37941,
            "percentage": 7.7
        },
        {
            "category": "Cheatings",
            "count": 23911,
            "percentage": 4.9
        },
        {
            "category": "Molestation & Harassment",
            "count": 15922,
            "percentage": 3.2
        },
        {
            "category": "Burglary",
            "count": 11462,
            "percentage": 2.3
        },
        {
            "category": "Murder",
            "count": 2803,
            "percentage": 0.6
        },
        {
            "category": "Rape",
            "count": 2247,
            "percentage": 0.5
        },
        {
            "category": "Kidnapping (Women & Girls)",
            "count": 1729,
            "percentage": 0.4
        },
        {
            "category": "Riots",
            "count": 1016,
            "percentage": 0.2
        },
        {
            "category": "Kidnapping (Others)",
            "count": 755,
            "percentage": 0.2
        },
        {
            "category": "Robbery",
            "count": 750,
            "percentage": 0.2
        },
        {
            "category": "Dowry Deaths",
            "count": 303,
            "percentage": 0.1
        },
        {
            "category": "Dacoity",
            "count": 156,
            "percentage": 0
        }
    ],
    "severityBreakdown": [
        {
            "severity": "LOW",
            "count": 454882
        },
        {
            "severity": "MEDIUM",
            "count": 29150
        },
        {
            "severity": "HIGH",
            "count": 2787
        },
        {
            "severity": "CRITICAL",
            "count": 5206
        }
    ],
    "yearly": {
        "2021": 179611,
        "2022": 158547,
        "2023": 153867
    }
};
exports.DISTRICT_METRICS = {
    "Srikakulam": {
        "district": "Srikakulam",
        "totalRecords": 18857,
        "topCategory": "Other Crimes",
        "topCategoryCount": 16030,
        "topCategoryPercentage": 85,
        "safetyRatio": 98.8,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 16030,
                "percentage": 85
            },
            {
                "category": "Other IPC Crimes",
                "count": 771,
                "percentage": 4.1
            },
            {
                "category": "Molestation & Harassment",
                "count": 522,
                "percentage": 2.8
            },
            {
                "category": "Cheatings",
                "count": 491,
                "percentage": 2.6
            },
            {
                "category": "Theft",
                "count": 475,
                "percentage": 2.5
            },
            {
                "category": "Burglary",
                "count": 302,
                "percentage": 1.6
            },
            {
                "category": "Rape",
                "count": 96,
                "percentage": 0.5
            },
            {
                "category": "Murder",
                "count": 73,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 34,
                "percentage": 0.2
            },
            {
                "category": "Riots",
                "count": 32,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 13,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 11,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 4,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 3,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 17767
            },
            {
                "severity": "MEDIUM",
                "count": 869
            },
            {
                "severity": "HIGH",
                "count": 49
            },
            {
                "severity": "CRITICAL",
                "count": 172
            }
        ],
        "yearly": {
            "2021": 5033,
            "2022": 5204,
            "2023": 8620
        }
    },
    "Vizianagaram": {
        "district": "Vizianagaram",
        "totalRecords": 16830,
        "topCategory": "Other Crimes",
        "topCategoryCount": 12581,
        "topCategoryPercentage": 74.8,
        "safetyRatio": 97.7,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 12581,
                "percentage": 74.8
            },
            {
                "category": "Other IPC Crimes",
                "count": 1426,
                "percentage": 8.5
            },
            {
                "category": "Theft",
                "count": 987,
                "percentage": 5.9
            },
            {
                "category": "Molestation & Harassment",
                "count": 528,
                "percentage": 3.1
            },
            {
                "category": "Cheatings",
                "count": 498,
                "percentage": 3
            },
            {
                "category": "Burglary",
                "count": 401,
                "percentage": 2.4
            },
            {
                "category": "Rape",
                "count": 129,
                "percentage": 0.8
            },
            {
                "category": "Kidnapping (Others)",
                "count": 100,
                "percentage": 0.6
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 73,
                "percentage": 0.4
            },
            {
                "category": "Murder",
                "count": 70,
                "percentage": 0.4
            },
            {
                "category": "Robbery",
                "count": 21,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 8,
                "percentage": 0
            },
            {
                "category": "Riots",
                "count": 7,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 1,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 15492
            },
            {
                "severity": "MEDIUM",
                "count": 957
            },
            {
                "severity": "HIGH",
                "count": 181
            },
            {
                "severity": "CRITICAL",
                "count": 200
            }
        ],
        "yearly": {
            "2021": 5307,
            "2022": 5034,
            "2023": 6489
        }
    },
    "Visakhapatnam": {
        "district": "Visakhapatnam",
        "totalRecords": 29231,
        "topCategory": "Other Crimes",
        "topCategoryCount": 20253,
        "topCategoryPercentage": 69.3,
        "safetyRatio": 97.9,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 20253,
                "percentage": 69.3
            },
            {
                "category": "Other IPC Crimes",
                "count": 2490,
                "percentage": 8.5
            },
            {
                "category": "Theft",
                "count": 2009,
                "percentage": 6.9
            },
            {
                "category": "Cheatings",
                "count": 1921,
                "percentage": 6.6
            },
            {
                "category": "Molestation & Harassment",
                "count": 1212,
                "percentage": 4.1
            },
            {
                "category": "Burglary",
                "count": 669,
                "percentage": 2.3
            },
            {
                "category": "Rape",
                "count": 313,
                "percentage": 1.1
            },
            {
                "category": "Murder",
                "count": 139,
                "percentage": 0.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 73,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 45,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 42,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 30,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 20,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 15,
                "percentage": 0.1
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 26673
            },
            {
                "severity": "MEDIUM",
                "count": 1956
            },
            {
                "severity": "HIGH",
                "count": 135
            },
            {
                "severity": "CRITICAL",
                "count": 467
            }
        ],
        "yearly": {
            "2021": 16065,
            "2022": 7980,
            "2023": 5186
        }
    },
    "Parvathipuram Manyam": {
        "district": "Parvathipuram Manyam",
        "totalRecords": 4958,
        "topCategory": "Other Crimes",
        "topCategoryCount": 2369,
        "topCategoryPercentage": 47.8,
        "safetyRatio": 98.4,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 2369,
                "percentage": 47.8
            },
            {
                "category": "Other IPC Crimes",
                "count": 2040,
                "percentage": 41.1
            },
            {
                "category": "Theft",
                "count": 135,
                "percentage": 2.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 129,
                "percentage": 2.6
            },
            {
                "category": "Cheatings",
                "count": 104,
                "percentage": 2.1
            },
            {
                "category": "Burglary",
                "count": 93,
                "percentage": 1.9
            },
            {
                "category": "Rape",
                "count": 33,
                "percentage": 0.7
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 33,
                "percentage": 0.7
            },
            {
                "category": "Murder",
                "count": 11,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 4,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 3,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 3,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 1,
                "percentage": 0
            },
            {
                "category": "Kidnapping (Others)",
                "count": 0,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 4648
            },
            {
                "severity": "MEDIUM",
                "count": 229
            },
            {
                "severity": "HIGH",
                "count": 36
            },
            {
                "severity": "CRITICAL",
                "count": 45
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 2224,
            "2023": 2734
        }
    },
    "Alluri Sitharama Raju": {
        "district": "Alluri Sitharama Raju",
        "totalRecords": 2007,
        "topCategory": "Other Crimes",
        "topCategoryCount": 1201,
        "topCategoryPercentage": 59.8,
        "safetyRatio": 94.3,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 1201,
                "percentage": 59.8
            },
            {
                "category": "Other IPC Crimes",
                "count": 438,
                "percentage": 21.8
            },
            {
                "category": "Theft",
                "count": 79,
                "percentage": 3.9
            },
            {
                "category": "Cheatings",
                "count": 63,
                "percentage": 3.1
            },
            {
                "category": "Murder",
                "count": 58,
                "percentage": 2.9
            },
            {
                "category": "Burglary",
                "count": 52,
                "percentage": 2.6
            },
            {
                "category": "Molestation & Harassment",
                "count": 49,
                "percentage": 2.4
            },
            {
                "category": "Rape",
                "count": 44,
                "percentage": 2.2
            },
            {
                "category": "Riots",
                "count": 9,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Others)",
                "count": 5,
                "percentage": 0.2
            },
            {
                "category": "Dowry Deaths",
                "count": 4,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 2,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 2,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 1,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 1781
            },
            {
                "severity": "MEDIUM",
                "count": 112
            },
            {
                "severity": "HIGH",
                "count": 11
            },
            {
                "severity": "CRITICAL",
                "count": 103
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 998,
            "2023": 1009
        }
    },
    "East Godavari": {
        "district": "East Godavari",
        "totalRecords": 22246,
        "topCategory": "Other Crimes",
        "topCategoryCount": 15707,
        "topCategoryPercentage": 70.6,
        "safetyRatio": 98,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 15707,
                "percentage": 70.6
            },
            {
                "category": "Theft",
                "count": 2426,
                "percentage": 10.9
            },
            {
                "category": "Other IPC Crimes",
                "count": 1035,
                "percentage": 4.7
            },
            {
                "category": "Cheatings",
                "count": 992,
                "percentage": 4.5
            },
            {
                "category": "Molestation & Harassment",
                "count": 844,
                "percentage": 3.8
            },
            {
                "category": "Burglary",
                "count": 676,
                "percentage": 3
            },
            {
                "category": "Rape",
                "count": 165,
                "percentage": 0.7
            },
            {
                "category": "Murder",
                "count": 113,
                "percentage": 0.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 82,
                "percentage": 0.4
            },
            {
                "category": "Robbery",
                "count": 70,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 63,
                "percentage": 0.3
            },
            {
                "category": "Riots",
                "count": 48,
                "percentage": 0.2
            },
            {
                "category": "Dowry Deaths",
                "count": 16,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 9,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 20160
            },
            {
                "severity": "MEDIUM",
                "count": 1638
            },
            {
                "severity": "HIGH",
                "count": 161
            },
            {
                "severity": "CRITICAL",
                "count": 287
            }
        ],
        "yearly": {
            "2021": 9535,
            "2022": 6790,
            "2023": 5921
        }
    },
    "Rajamahendravaram": {
        "district": "Rajamahendravaram",
        "totalRecords": 5270,
        "topCategory": "Other Crimes",
        "topCategoryCount": 3608,
        "topCategoryPercentage": 68.5,
        "safetyRatio": 97.7,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 3608,
                "percentage": 68.5
            },
            {
                "category": "Theft",
                "count": 662,
                "percentage": 12.6
            },
            {
                "category": "Other IPC Crimes",
                "count": 336,
                "percentage": 6.4
            },
            {
                "category": "Cheatings",
                "count": 222,
                "percentage": 4.2
            },
            {
                "category": "Burglary",
                "count": 159,
                "percentage": 3
            },
            {
                "category": "Molestation & Harassment",
                "count": 130,
                "percentage": 2.5
            },
            {
                "category": "Rape",
                "count": 59,
                "percentage": 1.1
            },
            {
                "category": "Robbery",
                "count": 29,
                "percentage": 0.6
            },
            {
                "category": "Murder",
                "count": 27,
                "percentage": 0.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 27,
                "percentage": 0.5
            },
            {
                "category": "Dowry Deaths",
                "count": 4,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 4,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 2,
                "percentage": 0
            },
            {
                "category": "Riots",
                "count": 1,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 4828
            },
            {
                "severity": "MEDIUM",
                "count": 319
            },
            {
                "severity": "HIGH",
                "count": 33
            },
            {
                "severity": "CRITICAL",
                "count": 90
            }
        ],
        "yearly": {
            "2021": 5270,
            "2022": 0,
            "2023": 0
        }
    },
    "Anakapalli": {
        "district": "Anakapalli",
        "totalRecords": 10312,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7941,
        "topCategoryPercentage": 77,
        "safetyRatio": 98.5,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7941,
                "percentage": 77
            },
            {
                "category": "Other IPC Crimes",
                "count": 664,
                "percentage": 6.4
            },
            {
                "category": "Theft",
                "count": 555,
                "percentage": 5.4
            },
            {
                "category": "Molestation & Harassment",
                "count": 424,
                "percentage": 4.1
            },
            {
                "category": "Burglary",
                "count": 275,
                "percentage": 2.7
            },
            {
                "category": "Cheatings",
                "count": 275,
                "percentage": 2.7
            },
            {
                "category": "Rape",
                "count": 61,
                "percentage": 0.6
            },
            {
                "category": "Murder",
                "count": 40,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 36,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 14,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 9,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 9,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 5,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 4,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 9435
            },
            {
                "severity": "MEDIUM",
                "count": 718
            },
            {
                "severity": "HIGH",
                "count": 54
            },
            {
                "severity": "CRITICAL",
                "count": 105
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 4565,
            "2023": 5747
        }
    },
    "West Godavari": {
        "district": "West Godavari",
        "totalRecords": 26442,
        "topCategory": "Other Crimes",
        "topCategoryCount": 15187,
        "topCategoryPercentage": 57.4,
        "safetyRatio": 99,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 15187,
                "percentage": 57.4
            },
            {
                "category": "Other IPC Crimes",
                "count": 6231,
                "percentage": 23.6
            },
            {
                "category": "Theft",
                "count": 2116,
                "percentage": 8
            },
            {
                "category": "Cheatings",
                "count": 1018,
                "percentage": 3.8
            },
            {
                "category": "Molestation & Harassment",
                "count": 799,
                "percentage": 3
            },
            {
                "category": "Burglary",
                "count": 759,
                "percentage": 2.9
            },
            {
                "category": "Rape",
                "count": 99,
                "percentage": 0.4
            },
            {
                "category": "Murder",
                "count": 85,
                "percentage": 0.3
            },
            {
                "category": "Riots",
                "count": 49,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 36,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 26,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 19,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 10,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 8,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 24552
            },
            {
                "severity": "MEDIUM",
                "count": 1633
            },
            {
                "severity": "HIGH",
                "count": 65
            },
            {
                "severity": "CRITICAL",
                "count": 192
            }
        ],
        "yearly": {
            "2021": 19460,
            "2022": 4657,
            "2023": 2325
        }
    },
    "Kakinada": {
        "district": "Kakinada",
        "totalRecords": 9689,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7056,
        "topCategoryPercentage": 72.8,
        "safetyRatio": 98.5,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7056,
                "percentage": 72.8
            },
            {
                "category": "Theft",
                "count": 1231,
                "percentage": 12.7
            },
            {
                "category": "Other IPC Crimes",
                "count": 471,
                "percentage": 4.9
            },
            {
                "category": "Cheatings",
                "count": 294,
                "percentage": 3
            },
            {
                "category": "Burglary",
                "count": 243,
                "percentage": 2.5
            },
            {
                "category": "Molestation & Harassment",
                "count": 227,
                "percentage": 2.3
            },
            {
                "category": "Murder",
                "count": 57,
                "percentage": 0.6
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 43,
                "percentage": 0.4
            },
            {
                "category": "Rape",
                "count": 27,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 15,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 13,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 7,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 5,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 0,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 9052
            },
            {
                "severity": "MEDIUM",
                "count": 490
            },
            {
                "severity": "HIGH",
                "count": 63
            },
            {
                "severity": "CRITICAL",
                "count": 84
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 5326,
            "2023": 4363
        }
    },
    "Krishna": {
        "district": "Krishna",
        "totalRecords": 25089,
        "topCategory": "Other Crimes",
        "topCategoryCount": 18033,
        "topCategoryPercentage": 71.9,
        "safetyRatio": 97.7,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 18033,
                "percentage": 71.9
            },
            {
                "category": "Other IPC Crimes",
                "count": 2566,
                "percentage": 10.2
            },
            {
                "category": "Theft",
                "count": 1578,
                "percentage": 6.3
            },
            {
                "category": "Cheatings",
                "count": 989,
                "percentage": 3.9
            },
            {
                "category": "Molestation & Harassment",
                "count": 962,
                "percentage": 3.8
            },
            {
                "category": "Burglary",
                "count": 339,
                "percentage": 1.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 278,
                "percentage": 1.1
            },
            {
                "category": "Rape",
                "count": 113,
                "percentage": 0.5
            },
            {
                "category": "Murder",
                "count": 106,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Others)",
                "count": 49,
                "percentage": 0.2
            },
            {
                "category": "Riots",
                "count": 33,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 22,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 18,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 3,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 23166
            },
            {
                "severity": "MEDIUM",
                "count": 1352
            },
            {
                "severity": "HIGH",
                "count": 349
            },
            {
                "severity": "CRITICAL",
                "count": 222
            }
        ],
        "yearly": {
            "2021": 12222,
            "2022": 6638,
            "2023": 6229
        }
    },
    "Dr.B.R.Ambedkar Konaseema": {
        "district": "Dr.B.R.Ambedkar Konaseema",
        "totalRecords": 10492,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7901,
        "topCategoryPercentage": 75.3,
        "safetyRatio": 98.2,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7901,
                "percentage": 75.3
            },
            {
                "category": "Theft",
                "count": 778,
                "percentage": 7.4
            },
            {
                "category": "Molestation & Harassment",
                "count": 582,
                "percentage": 5.5
            },
            {
                "category": "Cheatings",
                "count": 432,
                "percentage": 4.1
            },
            {
                "category": "Other IPC Crimes",
                "count": 326,
                "percentage": 3.1
            },
            {
                "category": "Burglary",
                "count": 265,
                "percentage": 2.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 73,
                "percentage": 0.7
            },
            {
                "category": "Rape",
                "count": 45,
                "percentage": 0.4
            },
            {
                "category": "Murder",
                "count": 41,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Others)",
                "count": 18,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 18,
                "percentage": 0.2
            },
            {
                "category": "Dowry Deaths",
                "count": 8,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 3,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 2,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 9437
            },
            {
                "severity": "MEDIUM",
                "count": 868
            },
            {
                "severity": "HIGH",
                "count": 99
            },
            {
                "severity": "CRITICAL",
                "count": 88
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 5391,
            "2023": 5101
        }
    },
    "NTR (Vijayawada)": {
        "district": "NTR (Vijayawada)",
        "totalRecords": 34561,
        "topCategory": "Other Crimes",
        "topCategoryCount": 26749,
        "topCategoryPercentage": 77.4,
        "safetyRatio": 98.7,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 26749,
                "percentage": 77.4
            },
            {
                "category": "Theft",
                "count": 3272,
                "percentage": 9.5
            },
            {
                "category": "Cheatings",
                "count": 1620,
                "percentage": 4.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 1149,
                "percentage": 3.3
            },
            {
                "category": "Other IPC Crimes",
                "count": 639,
                "percentage": 1.8
            },
            {
                "category": "Burglary",
                "count": 595,
                "percentage": 1.7
            },
            {
                "category": "Rape",
                "count": 177,
                "percentage": 0.5
            },
            {
                "category": "Murder",
                "count": 127,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 117,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 80,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 21,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 7,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 4,
                "percentage": 0
            },
            {
                "category": "Riots",
                "count": 4,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 32280
            },
            {
                "severity": "MEDIUM",
                "count": 1828
            },
            {
                "severity": "HIGH",
                "count": 145
            },
            {
                "severity": "CRITICAL",
                "count": 308
            }
        ],
        "yearly": {
            "2021": 9710,
            "2022": 13694,
            "2023": 11157
        }
    },
    "Guntur": {
        "district": "Guntur",
        "totalRecords": 37273,
        "topCategory": "Other Crimes",
        "topCategoryCount": 26323,
        "topCategoryPercentage": 70.6,
        "safetyRatio": 98.3,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 26323,
                "percentage": 70.6
            },
            {
                "category": "Theft",
                "count": 3636,
                "percentage": 9.8
            },
            {
                "category": "Cheatings",
                "count": 3262,
                "percentage": 8.8
            },
            {
                "category": "Molestation & Harassment",
                "count": 1293,
                "percentage": 3.5
            },
            {
                "category": "Other IPC Crimes",
                "count": 1150,
                "percentage": 3.1
            },
            {
                "category": "Burglary",
                "count": 774,
                "percentage": 2.1
            },
            {
                "category": "Murder",
                "count": 190,
                "percentage": 0.5
            },
            {
                "category": "Rape",
                "count": 186,
                "percentage": 0.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 170,
                "percentage": 0.5
            },
            {
                "category": "Riots",
                "count": 123,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 82,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 57,
                "percentage": 0.2
            },
            {
                "category": "Dowry Deaths",
                "count": 18,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 9,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 34371
            },
            {
                "severity": "MEDIUM",
                "count": 2272
            },
            {
                "severity": "HIGH",
                "count": 245
            },
            {
                "severity": "CRITICAL",
                "count": 385
            }
        ],
        "yearly": {
            "2021": 19746,
            "2022": 9468,
            "2023": 8059
        }
    },
    "Eluru": {
        "district": "Eluru",
        "totalRecords": 16749,
        "topCategory": "Other Crimes",
        "topCategoryCount": 10298,
        "topCategoryPercentage": 61.5,
        "safetyRatio": 98.5,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 10298,
                "percentage": 61.5
            },
            {
                "category": "Other IPC Crimes",
                "count": 2978,
                "percentage": 17.8
            },
            {
                "category": "Theft",
                "count": 1183,
                "percentage": 7.1
            },
            {
                "category": "Cheatings",
                "count": 880,
                "percentage": 5.3
            },
            {
                "category": "Molestation & Harassment",
                "count": 725,
                "percentage": 4.3
            },
            {
                "category": "Burglary",
                "count": 417,
                "percentage": 2.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 98,
                "percentage": 0.6
            },
            {
                "category": "Murder",
                "count": 69,
                "percentage": 0.4
            },
            {
                "category": "Rape",
                "count": 53,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 16,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 14,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 8,
                "percentage": 0
            },
            {
                "category": "Kidnapping (Others)",
                "count": 7,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 3,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 15339
            },
            {
                "severity": "MEDIUM",
                "count": 1166
            },
            {
                "severity": "HIGH",
                "count": 119
            },
            {
                "severity": "CRITICAL",
                "count": 125
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 9047,
            "2023": 7702
        }
    },
    "Prakasam": {
        "district": "Prakasam",
        "totalRecords": 27311,
        "topCategory": "Other Crimes",
        "topCategoryCount": 20471,
        "topCategoryPercentage": 75,
        "safetyRatio": 98.8,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 20471,
                "percentage": 75
            },
            {
                "category": "Other IPC Crimes",
                "count": 2087,
                "percentage": 7.6
            },
            {
                "category": "Theft",
                "count": 1531,
                "percentage": 5.6
            },
            {
                "category": "Cheatings",
                "count": 1283,
                "percentage": 4.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 897,
                "percentage": 3.3
            },
            {
                "category": "Burglary",
                "count": 603,
                "percentage": 2.2
            },
            {
                "category": "Murder",
                "count": 162,
                "percentage": 0.6
            },
            {
                "category": "Riots",
                "count": 81,
                "percentage": 0.3
            },
            {
                "category": "Rape",
                "count": 80,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 45,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 31,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 24,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 8,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 8,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 25372
            },
            {
                "severity": "MEDIUM",
                "count": 1605
            },
            {
                "severity": "HIGH",
                "count": 84
            },
            {
                "severity": "CRITICAL",
                "count": 250
            }
        ],
        "yearly": {
            "2021": 12588,
            "2022": 7114,
            "2023": 7609
        }
    },
    "SPS Nellore": {
        "district": "SPS Nellore",
        "totalRecords": 22237,
        "topCategory": "Other Crimes",
        "topCategoryCount": 13027,
        "topCategoryPercentage": 58.6,
        "safetyRatio": 98.1,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 13027,
                "percentage": 58.6
            },
            {
                "category": "Other IPC Crimes",
                "count": 4442,
                "percentage": 20
            },
            {
                "category": "Theft",
                "count": 1623,
                "percentage": 7.3
            },
            {
                "category": "Cheatings",
                "count": 1027,
                "percentage": 4.6
            },
            {
                "category": "Burglary",
                "count": 825,
                "percentage": 3.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 801,
                "percentage": 3.6
            },
            {
                "category": "Murder",
                "count": 183,
                "percentage": 0.8
            },
            {
                "category": "Rape",
                "count": 95,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Others)",
                "count": 55,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 48,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 43,
                "percentage": 0.2
            },
            {
                "category": "Riots",
                "count": 37,
                "percentage": 0.2
            },
            {
                "category": "Dacoity",
                "count": 20,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 11,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 20119
            },
            {
                "severity": "MEDIUM",
                "count": 1706
            },
            {
                "severity": "HIGH",
                "count": 114
            },
            {
                "severity": "CRITICAL",
                "count": 298
            }
        ],
        "yearly": {
            "2021": 7880,
            "2022": 8350,
            "2023": 6007
        }
    },
    "YSR Kadapa": {
        "district": "YSR Kadapa",
        "totalRecords": 22657,
        "topCategory": "Other Crimes",
        "topCategoryCount": 15562,
        "topCategoryPercentage": 68.7,
        "safetyRatio": 98.7,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 15562,
                "percentage": 68.7
            },
            {
                "category": "Other IPC Crimes",
                "count": 4088,
                "percentage": 18
            },
            {
                "category": "Theft",
                "count": 968,
                "percentage": 4.3
            },
            {
                "category": "Cheatings",
                "count": 815,
                "percentage": 3.6
            },
            {
                "category": "Molestation & Harassment",
                "count": 480,
                "percentage": 2.1
            },
            {
                "category": "Burglary",
                "count": 413,
                "percentage": 1.8
            },
            {
                "category": "Murder",
                "count": 166,
                "percentage": 0.7
            },
            {
                "category": "Rape",
                "count": 56,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 33,
                "percentage": 0.1
            },
            {
                "category": "Riots",
                "count": 31,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 15,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 14,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 13,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 3,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 21433
            },
            {
                "severity": "MEDIUM",
                "count": 939
            },
            {
                "severity": "HIGH",
                "count": 60
            },
            {
                "severity": "CRITICAL",
                "count": 225
            }
        ],
        "yearly": {
            "2021": 8606,
            "2022": 6448,
            "2023": 7603
        }
    },
    "Kurnool": {
        "district": "Kurnool",
        "totalRecords": 26491,
        "topCategory": "Other Crimes",
        "topCategoryCount": 20253,
        "topCategoryPercentage": 76.5,
        "safetyRatio": 98.2,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 20253,
                "percentage": 76.5
            },
            {
                "category": "Other IPC Crimes",
                "count": 1809,
                "percentage": 6.8
            },
            {
                "category": "Cheatings",
                "count": 1390,
                "percentage": 5.2
            },
            {
                "category": "Theft",
                "count": 1044,
                "percentage": 3.9
            },
            {
                "category": "Molestation & Harassment",
                "count": 734,
                "percentage": 2.8
            },
            {
                "category": "Burglary",
                "count": 653,
                "percentage": 2.5
            },
            {
                "category": "Murder",
                "count": 168,
                "percentage": 0.6
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 157,
                "percentage": 0.6
            },
            {
                "category": "Riots",
                "count": 92,
                "percentage": 0.3
            },
            {
                "category": "Rape",
                "count": 86,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 45,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 38,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 12,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 10,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 24496
            },
            {
                "severity": "MEDIUM",
                "count": 1517
            },
            {
                "severity": "HIGH",
                "count": 214
            },
            {
                "severity": "CRITICAL",
                "count": 264
            }
        ],
        "yearly": {
            "2021": 13996,
            "2022": 4635,
            "2023": 7860
        }
    },
    "Bapatla": {
        "district": "Bapatla",
        "totalRecords": 11284,
        "topCategory": "Other Crimes",
        "topCategoryCount": 8080,
        "topCategoryPercentage": 71.6,
        "safetyRatio": 98.3,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 8080,
                "percentage": 71.6
            },
            {
                "category": "Other IPC Crimes",
                "count": 1099,
                "percentage": 9.7
            },
            {
                "category": "Theft",
                "count": 757,
                "percentage": 6.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 419,
                "percentage": 3.7
            },
            {
                "category": "Cheatings",
                "count": 411,
                "percentage": 3.6
            },
            {
                "category": "Burglary",
                "count": 278,
                "percentage": 2.5
            },
            {
                "category": "Murder",
                "count": 116,
                "percentage": 1
            },
            {
                "category": "Rape",
                "count": 40,
                "percentage": 0.4
            },
            {
                "category": "Riots",
                "count": 23,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 20,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 20,
                "percentage": 0.2
            },
            {
                "category": "Dacoity",
                "count": 9,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 6,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 6,
                "percentage": 0.1
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 10347
            },
            {
                "severity": "MEDIUM",
                "count": 740
            },
            {
                "severity": "HIGH",
                "count": 32
            },
            {
                "severity": "CRITICAL",
                "count": 165
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 5146,
            "2023": 6138
        }
    },
    "Anantapur": {
        "district": "Anantapur",
        "totalRecords": 26274,
        "topCategory": "Other Crimes",
        "topCategoryCount": 19810,
        "topCategoryPercentage": 75.4,
        "safetyRatio": 98.1,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 19810,
                "percentage": 75.4
            },
            {
                "category": "Cheatings",
                "count": 1613,
                "percentage": 6.1
            },
            {
                "category": "Other IPC Crimes",
                "count": 1467,
                "percentage": 5.6
            },
            {
                "category": "Theft",
                "count": 1366,
                "percentage": 5.2
            },
            {
                "category": "Molestation & Harassment",
                "count": 787,
                "percentage": 3
            },
            {
                "category": "Burglary",
                "count": 643,
                "percentage": 2.4
            },
            {
                "category": "Murder",
                "count": 202,
                "percentage": 0.8
            },
            {
                "category": "Rape",
                "count": 134,
                "percentage": 0.5
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 91,
                "percentage": 0.3
            },
            {
                "category": "Riots",
                "count": 72,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 35,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 28,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 18,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 8,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 24256
            },
            {
                "severity": "MEDIUM",
                "count": 1530
            },
            {
                "severity": "HIGH",
                "count": 144
            },
            {
                "severity": "CRITICAL",
                "count": 344
            }
        ],
        "yearly": {
            "2021": 15017,
            "2022": 5342,
            "2023": 5915
        }
    },
    "Palnadu": {
        "district": "Palnadu",
        "totalRecords": 9212,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7182,
        "topCategoryPercentage": 78,
        "safetyRatio": 98.4,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7182,
                "percentage": 78
            },
            {
                "category": "Theft",
                "count": 698,
                "percentage": 7.6
            },
            {
                "category": "Cheatings",
                "count": 354,
                "percentage": 3.8
            },
            {
                "category": "Other IPC Crimes",
                "count": 309,
                "percentage": 3.4
            },
            {
                "category": "Molestation & Harassment",
                "count": 237,
                "percentage": 2.6
            },
            {
                "category": "Burglary",
                "count": 235,
                "percentage": 2.6
            },
            {
                "category": "Murder",
                "count": 84,
                "percentage": 0.9
            },
            {
                "category": "Riots",
                "count": 39,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 38,
                "percentage": 0.4
            },
            {
                "category": "Rape",
                "count": 16,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 9,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 7,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 4,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 0,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 8543
            },
            {
                "severity": "MEDIUM",
                "count": 518
            },
            {
                "severity": "HIGH",
                "count": 51
            },
            {
                "severity": "CRITICAL",
                "count": 100
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 4658,
            "2023": 4554
        }
    },
    "Chittoor": {
        "district": "Chittoor",
        "totalRecords": 26002,
        "topCategory": "Other Crimes",
        "topCategoryCount": 15429,
        "topCategoryPercentage": 59.3,
        "safetyRatio": 98.9,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 15429,
                "percentage": 59.3
            },
            {
                "category": "Other IPC Crimes",
                "count": 7175,
                "percentage": 27.6
            },
            {
                "category": "Theft",
                "count": 1358,
                "percentage": 5.2
            },
            {
                "category": "Cheatings",
                "count": 718,
                "percentage": 2.8
            },
            {
                "category": "Burglary",
                "count": 470,
                "percentage": 1.8
            },
            {
                "category": "Molestation & Harassment",
                "count": 450,
                "percentage": 1.7
            },
            {
                "category": "Murder",
                "count": 145,
                "percentage": 0.6
            },
            {
                "category": "Riots",
                "count": 100,
                "percentage": 0.4
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 39,
                "percentage": 0.1
            },
            {
                "category": "Rape",
                "count": 35,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Others)",
                "count": 35,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 25,
                "percentage": 0.1
            },
            {
                "category": "Robbery",
                "count": 13,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 10,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 24680
            },
            {
                "severity": "MEDIUM",
                "count": 1033
            },
            {
                "severity": "HIGH",
                "count": 99
            },
            {
                "severity": "CRITICAL",
                "count": 190
            }
        ],
        "yearly": {
            "2021": 12697,
            "2022": 7280,
            "2023": 6025
        }
    },
    "Tirupati": {
        "district": "Tirupati",
        "totalRecords": 18727,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7890,
        "topCategoryPercentage": 42.1,
        "safetyRatio": 98.6,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7890,
                "percentage": 42.1
            },
            {
                "category": "Other IPC Crimes",
                "count": 5888,
                "percentage": 31.4
            },
            {
                "category": "Theft",
                "count": 2079,
                "percentage": 11.1
            },
            {
                "category": "Cheatings",
                "count": 1326,
                "percentage": 7.1
            },
            {
                "category": "Burglary",
                "count": 634,
                "percentage": 3.4
            },
            {
                "category": "Molestation & Harassment",
                "count": 528,
                "percentage": 2.8
            },
            {
                "category": "Murder",
                "count": 118,
                "percentage": 0.6
            },
            {
                "category": "Riots",
                "count": 77,
                "percentage": 0.4
            },
            {
                "category": "Rape",
                "count": 57,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 46,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 35,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 23,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 14,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 12,
                "percentage": 0.1
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 17183
            },
            {
                "severity": "MEDIUM",
                "count": 1285
            },
            {
                "severity": "HIGH",
                "count": 70
            },
            {
                "severity": "CRITICAL",
                "count": 189
            }
        ],
        "yearly": {
            "2021": 5556,
            "2022": 7045,
            "2023": 6126
        }
    },
    "Vijayawada Railway": {
        "district": "Vijayawada Railway",
        "totalRecords": 2612,
        "topCategory": "Theft",
        "topCategoryCount": 2437,
        "topCategoryPercentage": 93.3,
        "safetyRatio": 99.3,
        "categories": [
            {
                "category": "Theft",
                "count": 2437,
                "percentage": 93.3
            },
            {
                "category": "Other Crimes",
                "count": 123,
                "percentage": 4.7
            },
            {
                "category": "Molestation & Harassment",
                "count": 13,
                "percentage": 0.5
            },
            {
                "category": "Other IPC Crimes",
                "count": 10,
                "percentage": 0.4
            },
            {
                "category": "Cheatings",
                "count": 9,
                "percentage": 0.3
            },
            {
                "category": "Murder",
                "count": 8,
                "percentage": 0.3
            },
            {
                "category": "Kidnapping (Others)",
                "count": 6,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 3,
                "percentage": 0.1
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 2,
                "percentage": 0.1
            },
            {
                "category": "Rape",
                "count": 1,
                "percentage": 0
            },
            {
                "category": "Dowry Deaths",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Burglary",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Riots",
                "count": 0,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 2579
            },
            {
                "severity": "MEDIUM",
                "count": 16
            },
            {
                "severity": "HIGH",
                "count": 8
            },
            {
                "severity": "CRITICAL",
                "count": 9
            }
        ],
        "yearly": {
            "2021": 568,
            "2022": 831,
            "2023": 1213
        }
    },
    "Guntakal Railway": {
        "district": "Guntakal Railway",
        "totalRecords": 1577,
        "topCategory": "Theft",
        "topCategoryCount": 1426,
        "topCategoryPercentage": 90.4,
        "safetyRatio": 99.4,
        "categories": [
            {
                "category": "Theft",
                "count": 1426,
                "percentage": 90.4
            },
            {
                "category": "Other Crimes",
                "count": 86,
                "percentage": 5.5
            },
            {
                "category": "Other IPC Crimes",
                "count": 31,
                "percentage": 2
            },
            {
                "category": "Robbery",
                "count": 12,
                "percentage": 0.8
            },
            {
                "category": "Cheatings",
                "count": 8,
                "percentage": 0.5
            },
            {
                "category": "Murder",
                "count": 5,
                "percentage": 0.3
            },
            {
                "category": "Molestation & Harassment",
                "count": 4,
                "percentage": 0.3
            },
            {
                "category": "Dowry Deaths",
                "count": 3,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 1,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 1,
                "percentage": 0.1
            },
            {
                "category": "Rape",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Burglary",
                "count": 0,
                "percentage": 0
            },
            {
                "category": "Riots",
                "count": 0,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 1551
            },
            {
                "severity": "MEDIUM",
                "count": 16
            },
            {
                "severity": "HIGH",
                "count": 4
            },
            {
                "severity": "CRITICAL",
                "count": 6
            }
        ],
        "yearly": {
            "2021": 355,
            "2022": 630,
            "2023": 592
        }
    },
    "Nandyal": {
        "district": "Nandyal",
        "totalRecords": 9541,
        "topCategory": "Other Crimes",
        "topCategoryCount": 6538,
        "topCategoryPercentage": 68.5,
        "safetyRatio": 98.1,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 6538,
                "percentage": 68.5
            },
            {
                "category": "Cheatings",
                "count": 986,
                "percentage": 10.3
            },
            {
                "category": "Other IPC Crimes",
                "count": 700,
                "percentage": 7.3
            },
            {
                "category": "Theft",
                "count": 505,
                "percentage": 5.3
            },
            {
                "category": "Molestation & Harassment",
                "count": 371,
                "percentage": 3.9
            },
            {
                "category": "Burglary",
                "count": 212,
                "percentage": 2.2
            },
            {
                "category": "Murder",
                "count": 77,
                "percentage": 0.8
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 54,
                "percentage": 0.6
            },
            {
                "category": "Kidnapping (Others)",
                "count": 34,
                "percentage": 0.4
            },
            {
                "category": "Riots",
                "count": 25,
                "percentage": 0.3
            },
            {
                "category": "Robbery",
                "count": 19,
                "percentage": 0.2
            },
            {
                "category": "Rape",
                "count": 13,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 4,
                "percentage": 0
            },
            {
                "category": "Dacoity",
                "count": 3,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 8729
            },
            {
                "severity": "MEDIUM",
                "count": 627
            },
            {
                "severity": "HIGH",
                "count": 92
            },
            {
                "severity": "CRITICAL",
                "count": 93
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 5380,
            "2023": 4161
        }
    },
    "Sri Sathya Sai": {
        "district": "Sri Sathya Sai",
        "totalRecords": 10069,
        "topCategory": "Other Crimes",
        "topCategoryCount": 7639,
        "topCategoryPercentage": 75.9,
        "safetyRatio": 98.6,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 7639,
                "percentage": 75.9
            },
            {
                "category": "Cheatings",
                "count": 571,
                "percentage": 5.7
            },
            {
                "category": "Theft",
                "count": 542,
                "percentage": 5.4
            },
            {
                "category": "Other IPC Crimes",
                "count": 427,
                "percentage": 4.2
            },
            {
                "category": "Molestation & Harassment",
                "count": 418,
                "percentage": 4.2
            },
            {
                "category": "Burglary",
                "count": 269,
                "percentage": 2.7
            },
            {
                "category": "Murder",
                "count": 81,
                "percentage": 0.8
            },
            {
                "category": "Riots",
                "count": 46,
                "percentage": 0.5
            },
            {
                "category": "Robbery",
                "count": 18,
                "percentage": 0.2
            },
            {
                "category": "Rape",
                "count": 17,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 17,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 11,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 11,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 2,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 9179
            },
            {
                "severity": "MEDIUM",
                "count": 751
            },
            {
                "severity": "HIGH",
                "count": 39
            },
            {
                "severity": "CRITICAL",
                "count": 100
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 4385,
            "2023": 5684
        }
    },
    "Annamayya": {
        "district": "Annamayya",
        "totalRecords": 8025,
        "topCategory": "Other Crimes",
        "topCategoryCount": 5675,
        "topCategoryPercentage": 70.7,
        "safetyRatio": 98.4,
        "categories": [
            {
                "category": "Other Crimes",
                "count": 5675,
                "percentage": 70.7
            },
            {
                "category": "Other IPC Crimes",
                "count": 935,
                "percentage": 11.7
            },
            {
                "category": "Theft",
                "count": 485,
                "percentage": 6
            },
            {
                "category": "Cheatings",
                "count": 339,
                "percentage": 4.2
            },
            {
                "category": "Molestation & Harassment",
                "count": 208,
                "percentage": 2.6
            },
            {
                "category": "Burglary",
                "count": 208,
                "percentage": 2.6
            },
            {
                "category": "Murder",
                "count": 82,
                "percentage": 1
            },
            {
                "category": "Riots",
                "count": 31,
                "percentage": 0.4
            },
            {
                "category": "Rape",
                "count": 17,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Others)",
                "count": 15,
                "percentage": 0.2
            },
            {
                "category": "Robbery",
                "count": 13,
                "percentage": 0.2
            },
            {
                "category": "Kidnapping (Women & Girls)",
                "count": 9,
                "percentage": 0.1
            },
            {
                "category": "Dowry Deaths",
                "count": 7,
                "percentage": 0.1
            },
            {
                "category": "Dacoity",
                "count": 1,
                "percentage": 0
            }
        ],
        "severityBreakdown": [
            {
                "severity": "LOW",
                "count": 7434
            },
            {
                "severity": "MEDIUM",
                "count": 460
            },
            {
                "severity": "HIGH",
                "count": 31
            },
            {
                "severity": "CRITICAL",
                "count": 100
            }
        ],
        "yearly": {
            "2021": 0,
            "2022": 4287,
            "2023": 3738
        }
    }
};
const getDistrictMetrics = (district) => {
    const norm = (0, exports.normalizeDistrictName)(district);
    if (!norm)
        return exports.STATE_METRICS;
    return exports.DISTRICT_METRICS[norm] || exports.STATE_METRICS;
};
exports.getDistrictMetrics = getDistrictMetrics;
