// Synthèse des pièces fournies. Les pages renvoient à la pagination imprimée RGF00099.
// Les sources internes et les données de chantier ne sont pas incluses dans ce projet.
// A : prise d’office ; B : sur demande du Titulaire ; AB : les deux ; EXCLUDED : exception sur exigence expresse.

export const CATEGORIES = [
  {
    "id": "debut_reel",
    "label": "Début réel des travaux différent de l’OS",
    "group": "Dates",
    "initiative": "A",
    "hint": "La date réelle peut influer sur le décompte.",
    "page": 38
  },
  {
    "id": "intemperies_total",
    "label": "Interruption totale pour intempéries",
    "group": "Dates",
    "initiative": "A",
    "hint": "Relever nature et ampleur des intempéries.",
    "page": 38
  },
  {
    "id": "intemperies_partiel",
    "label": "Interruption partielle pour intempéries",
    "group": "Dates",
    "initiative": "B",
    "hint": "À la demande du Titulaire.",
    "page": 38
  },
  {
    "id": "limitation_dates",
    "label": "Début et fin de limitation de vitesse",
    "group": "Dates",
    "initiative": "A",
    "hint": "Lorsque la limitation comporte un délai particulier avec pénalités.",
    "page": 38
  },
  {
    "id": "reprise_reelle",
    "label": "Reprise des travaux différente de l’OS",
    "group": "Dates",
    "initiative": "A",
    "hint": "Date réelle différente de celle notifiée par l’OS de reprise.",
    "page": 38
  },
  {
    "id": "repliement",
    "label": "Repliement réel des installations",
    "group": "Dates",
    "initiative": "A",
    "hint": "Uniquement si le repliement fait l’objet d’une clause de pénalité.",
    "page": 38
  },
  {
    "id": "restitution_emplacements",
    "label": "Restitution des emplacements",
    "group": "Dates",
    "initiative": "A",
    "hint": "Lorsque non effectuée en fin de travaux ou à la fin du délai stipulé.",
    "page": 38
  },
  {
    "id": "fin_travaux",
    "label": "Fin de travaux",
    "group": "Dates",
    "initiative": "B",
    "hint": "À la demande du Titulaire.",
    "page": 38
  },
  {
    "id": "greve_sncf",
    "label": "Grève des agents SNCF",
    "group": "Anomalies et événements extérieurs",
    "initiative": "B",
    "hint": "Indiquer si SNCF a été réglementairement préavisée et l’incidence réelle sur l’exécution.",
    "page": 38
  },
  {
    "id": "greve_titulaire",
    "label": "Grève du Titulaire",
    "group": "Anomalies et événements extérieurs",
    "initiative": "A",
    "hint": "",
    "page": 38
  },
  {
    "id": "ltv_longueur",
    "label": "Dépassement de longueur de limitation temporaire de vitesse",
    "group": "Anomalies et événements extérieurs",
    "initiative": "A",
    "hint": "Mesure conservatoire prise par le MOE.",
    "page": 38
  },
  {
    "id": "ltv_taux",
    "label": "Modification du taux de limitation temporaire de vitesse",
    "group": "Anomalies et événements extérieurs",
    "initiative": "A",
    "hint": "Mesure conservatoire de sécurité prise par le MOE.",
    "page": 39
  },
  {
    "id": "arret_technique",
    "label": "Arrêt de chantier imposé par modifications techniques",
    "group": "Anomalies et événements extérieurs",
    "initiative": "A",
    "hint": "Consigner faits à l’origine de la modification et mesures pendant l’arrêt et pour la reprise ; la décision technique relève d’un OS.",
    "page": 39
  },
  {
    "id": "ajournement",
    "label": "Ajournement des travaux",
    "group": "Anomalies et événements extérieurs",
    "initiative": "A",
    "hint": "Consigner faits à l’origine et mesures prises.",
    "page": 39
  },
  {
    "id": "evenement_exceptionnel",
    "label": "Événement exceptionnel ou autre grève",
    "group": "Anomalies et événements extérieurs",
    "initiative": "AB",
    "hint": "Faits et conséquences uniquement ; ne pas écrire « force majeure ».",
    "page": 39
  },
  {
    "id": "retard_plans",
    "label": "Retard de remise de plans ou de visa MOE",
    "group": "Documents matériels et fournitures",
    "initiative": "B",
    "hint": "À la demande du Titulaire.",
    "page": 39
  },
  {
    "id": "retard_fournitures",
    "label": "Retard de mise à disposition de fournitures MOA",
    "group": "Documents matériels et fournitures",
    "initiative": "B",
    "hint": "Matériaux ou matériels dont la fourniture incombe au MOA.",
    "page": 39
  },
  {
    "id": "plans_reference",
    "label": "Plans types et documents techniques de référence",
    "group": "Documents matériels et fournitures",
    "initiative": "A",
    "hint": "Rappeler les références servant au constat de parties d’ouvrage qui deviendront invérifiables.",
    "page": 39
  },
  {
    "id": "materiel_onereux",
    "label": "Matériel mis à disposition du Titulaire à titre onéreux",
    "group": "Documents matériels et fournitures",
    "initiative": "A",
    "hint": "Préciser caractéristiques, dates de mise à disposition et de restitution.",
    "page": 39
  },
  {
    "id": "location_titulaire",
    "label": "Matériel du Titulaire loué par MOA ou MOE",
    "group": "Documents matériels et fournitures",
    "initiative": "B",
    "hint": "Caractéristiques et périodes d’utilisation.",
    "page": 39
  },
  {
    "id": "fournitures_onereuses",
    "label": "Fournitures ou services onéreux MOA/MOE au Titulaire",
    "group": "Documents matériels et fournitures",
    "initiative": "A",
    "hint": "En application d’une clause particulière ou document contractuel associé.",
    "page": 39
  },
  {
    "id": "materiaux_restitues",
    "label": "Matériaux déposés et restitués au MOA/MOE",
    "group": "Documents matériels et fournitures",
    "initiative": "A",
    "hint": "Relever tonnages et quantités conformément à la clause concernée.",
    "page": 39
  },
  {
    "id": "interceptions",
    "label": "Durées journalières d’intervention ou interception des circulations",
    "group": "Déroulement du chantier",
    "initiative": "A",
    "hint": "Suivant marché ; préciser périodes accordées mais non utilisées.",
    "page": 40
  },
  {
    "id": "consignations",
    "label": "Consignations de caténaires",
    "group": "Déroulement du chantier",
    "initiative": "A",
    "hint": "Traçabilité 9005 ou 9007.",
    "page": 40
  },
  {
    "id": "pertes_externes",
    "label": "Pertes de temps autres qu’imputables au Titulaire",
    "group": "Déroulement du chantier",
    "initiative": "B",
    "hint": "Préciser les causes invoquées par le Titulaire, sans les transformer en conclusion.",
    "page": 40
  },
  {
    "id": "pertes_titulaire",
    "label": "Pertes de temps imputables au Titulaire",
    "group": "Déroulement du chantier",
    "initiative": "A",
    "hint": "Si nécessaire selon règlement du marché (DQI, Kj…). Préciser dates, conditions et travaux.",
    "page": 40
  },
  {
    "id": "conditions_particulieres",
    "label": "Conditions particulières d’exécution",
    "group": "Déroulement du chantier",
    "initiative": "A",
    "hint": "Si différentes du marché : nuit, dimanche, férié ou chômé, obstacles, eau…",
    "page": 40
  },
  {
    "id": "ecart_forfait_cache",
    "label": "Travaux en plus ou en moins du forfait qui seront cachés",
    "group": "Déroulement du chantier",
    "initiative": "A",
    "hint": "Décrire les parties cachées et l’exécution réelle.",
    "page": 40
  },
  {
    "id": "nature_terrain",
    "label": "Nature des terrains rencontrés dans les fouilles",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Lorsque la nature du terrain influe sur paiement du terrassement.",
    "page": 40
  },
  {
    "id": "dimensions_fouilles",
    "label": "Dimensions réelles des fouilles",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Dimensions réelles, même si mode de paiement théorique/conventionnel.",
    "page": 40
  },
  {
    "id": "traction",
    "label": "Moyens de traction mis à disposition par le Titulaire",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Répété p41 : nombre, type, puissance, horaires de mise à disposition.",
    "page": 40
  },
  {
    "id": "transport_terres",
    "label": "Reprise et transport de terres ou gravois",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Lieux de chargement/déchargement, mode mécanique ou manuel et distance.",
    "page": 41
  },
  {
    "id": "manutention",
    "label": "Manutention et transport de matériaux",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "",
    "page": 41
  },
  {
    "id": "cote_eau",
    "label": "Cote de l’eau rencontrée dans les fouilles",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Lorsque ce fait influe sur paiement des travaux dans l’eau.",
    "page": 41
  },
  {
    "id": "pompage",
    "label": "Épuisement d’eau lors des fondations",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Durée du pompage et nature/caractéristiques du matériel.",
    "page": 41
  },
  {
    "id": "ouvrages_provisoires",
    "label": "Ouvrages provisoires",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "",
    "page": 41
  },
  {
    "id": "phases_provisoires",
    "label": "Phases de travaux provisoires",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "",
    "page": 41
  },
  {
    "id": "transports_seuil",
    "label": "Manutentions ou transports au-delà du seuil inclus dans les prix unitaires",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Modalités, quantités et distances.",
    "page": 41
  },
  {
    "id": "degarnissage",
    "label": "Déchargement des produits de dégarnissage",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Lieux désignés au marché ; si mode de règlement le nécessite.",
    "page": 41
  },
  {
    "id": "materiel_ferroviaire",
    "label": "Matériel ferroviaire mis à disposition du Titulaire",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Périodes, restitution, nature, nombre, caractéristiques des wagons, moyens de traction et personnel.",
    "page": 41
  },
  {
    "id": "bourrage",
    "label": "Bourrage et dressage mécanique lourd",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Relevé journalier adapté en feuille d’attachement spécifique.",
    "page": 41
  },
  {
    "id": "trains_travaux",
    "label": "Mise à disposition et utilisation des trains de travaux",
    "group": "Ouvrages devenant cachés",
    "initiative": "A",
    "hint": "Suivant dispositions du marché.",
    "page": 41
  },
  {
    "id": "origine_delai",
    "label": "Date d’origine du délai contractuel",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Prescrite par OS ou commande. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "remise_documents",
    "label": "Remise par Titulaire de plans, notes de calcul, études, programme, procédures ou historique",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Remise contre récépissé, LRAR ou voie dématérialisée selon art. 5.3 CCG T. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "remise_securite",
    "label": "Remise de documents de sécurité au Titulaire",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Remise contre récépissé. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "constat_materialite",
    "label": "Constat de matérialité des faits",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Déjà contradictoire. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "rapport_journalier",
    "label": "Rapport journalier du surveillant SNCF",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Contient de nombreux renseignements sans caractère d’attachement, même visé par le chef de chantier/équipe entreprise. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "cr_chantier",
    "label": "Compte rendu de réunion de chantier",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Mêle décisions à confirmer par OS, faits à constater séparément si nécessaire et appréciations. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "journal_chantier",
    "label": "Journal de chantier",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Document interne SNCF. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "proces_verbal",
    "label": "Procès-verbal",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Déjà signé des deux parties, ne pas en prendre attachement. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "avis_travaux",
    "label": "Avis hebdomadaires de travaux et avis travaux",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Documents internes SNCF. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 42
  },
  {
    "id": "carnets_depeches",
    "label": "Carnets de dépêches",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Le tableau les classe hors attachement, sans commentaire spécifique. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 43
  },
  {
    "id": "justification_delai",
    "label": "Justification du dépassement du délai contractuel",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Étude circonstanciée hors domaine de l’attachement. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 43
  },
  {
    "id": "modification_technique",
    "label": "Modifications techniques décidées en exécution",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Ordres de service, art. 2.8 et 14 CCG T. Les faits consécutifs d’arrêt peuvent relever d’un attachement distinct. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 43
  },
  {
    "id": "essais_techniques",
    "label": "Essais sur installations techniques",
    "group": "Hors attachement sauf demande expresse",
    "initiative": "EXCLUDED",
    "hint": "Procès-verbal signé des deux parties. Exigence expresse du Titulaire (en-tête du tableau 2, p42).",
    "page": 43
  }
];

export const RULES = [
  {
    "id": "purpose",
    "title": "Constater les faits avant qu’ils disparaissent",
    "text": "Constat sur chantier d’éléments qualitatifs et quantitatifs, faits et conditions d’exécution, notamment lorsqu’ils vont être cachés, inaccessibles ou difficilement vérifiables et peuvent influer sur le règlement.",
    "page": 33
  },
  {
    "id": "fact_only",
    "title": "Des faits, sans calcul ni interprétation",
    "text": "Refléter exactement les faits constatés, sans calculs ni interprétations. Relever les dimensions et quantités réellement constatées, les caractéristiques et circonstances utiles au règlement.",
    "page": 34
  },
  {
    "id": "before_disappearance",
    "title": "Rédiger en temps utile",
    "text": "Rédiger avant la disparition du fait, de l’événement ou du fait générateur, et avant qu’il ne devienne invérifiable.",
    "page": 34
  },
  {
    "id": "author",
    "title": "Rédaction par la MOE ou une personne désignée",
    "text": "Rédaction et établissement exclusivement par le représentant de la maîtrise d’œuvre ou une personne désignée à cet effet.",
    "page": 34
  },
  {
    "id": "initiative",
    "title": "Initiative et demande du Titulaire",
    "text": "Constater contradictoirement au fur et à mesure de l’avancement ; initiative MOE ou demande expresse du Titulaire formulée en temps utile.",
    "page": 34
  },
  {
    "id": "invitation",
    "title": "Convoquer et tracer la présence",
    "text": "Convoquer le Titulaire ; modalités admises citées : mention sur compte rendu de chantier, courrier officiel ou courriel. Tracer présence, absence et représentation.",
    "page": 34
  },
  {
    "id": "absent",
    "title": "Absence après convocation",
    "text": "Si le Titulaire ne répond pas à la convocation et ne se fait pas représenter, prise en son absence ; texte le réputant contradictoire et accepté (art. 12.12 CCG T).",
    "page": 37
  },
  {
    "id": "rescue",
    "title": "Recours à la PRM après sept jours",
    "text": "Si le MOE n’a pas procédé aux constatations dans les sept jours de la demande du Titulaire, celui-ci peut faire intervenir la PRM ; celle-ci, assistée d’un expert si besoin, peut se substituer au MOE.",
    "page": 34
  },
  {
    "id": "evidence",
    "title": "Photos, plans et relevés en annexes",
    "text": "Photographies commentées, croquis, plans ou dessins conformes à l’exécution et détaillés, graphiques et relevés de travaux peuvent être annexés à l’attachement ou aménagés eux-mêmes en attachement.",
    "page": 35
  },
  {
    "id": "sketch_legend",
    "title": "Croquis lisibles et légendés",
    "text": "Accompagner les croquis de légendes claires pour leur compréhension.",
    "page": 35
  },
  {
    "id": "paper_integrity",
    "title": "Intégrité de la feuille établie",
    "text": "Formalisation papier prévue à l’encre non effaçable, sans blanc ni rature, effaceur, surcharge, grattage ou collage.",
    "page": 35
  },
  {
    "id": "chronology",
    "title": "Ordre chronologique",
    "text": "Inscrire dans l’ordre chronologique des attachements, sans regroupement systématique des faits relatifs aux mêmes travaux.",
    "page": 35
  },
  {
    "id": "numbering",
    "title": "Numérotation continue par commande",
    "text": "Numérotation par commande, début à 1 et continuité pendant toute la durée du marché objet de la commande ; numéro d’ordre inscrit sur chaque document.",
    "page": 35
  },
  {
    "id": "framework_numbering",
    "title": "Accords-cadres et bons de commande",
    "text": "Accord-cadre : numérotation par ordre d’exécution ou bon de commande lancé dans chaque unité de production.",
    "page": 35
  },
  {
    "id": "lot_numbering",
    "title": "Numérotation par lot si retenue",
    "text": "Allotissement : le MOE peut proposer au représentant du MOA une numérotation par lot s’il la juge utile.",
    "page": 35
  },
  {
    "id": "template",
    "title": "Rubriques du modèle",
    "text": "Respecter les indications de l’en-tête des cases du document type.",
    "page": 35
  },
  {
    "id": "rectification",
    "title": "Rectifier par un nouvel attachement",
    "text": "Aucune rectification sur l’attachement établi. Créer un attachement rectificatif dans les mêmes conditions, avec la mention « annule et remplace le n° … en date du … » ; son numéro suit le dernier numéro pris.",
    "page": 36
  },
  {
    "id": "abrogation",
    "title": "Annuler par un attachement abrogatoire",
    "text": "Pour annuler un attachement, établir un attachement abrogatoire.",
    "page": 36
  },
  {
    "id": "moe_representative",
    "title": "Signataire habilité de la MOE",
    "text": "Les personnes désignées par SNCF pour signer doivent être communiquées au Titulaire dans le marché ou au plus tard à l’émission de l’OS fixant l’origine du délai contractuel.",
    "page": 36
  },
  {
    "id": "contractor_representative",
    "title": "Représentant du Titulaire",
    "text": "Le Titulaire fait connaître à la PRM et au MOE son représentant physique avant début d’exécution, au plus tard dans les quinze jours de la notification du marché (art. 2.22 CCG T).",
    "page": 36
  },
  {
    "id": "signature",
    "title": "Présentation à la signature",
    "text": "Présenter chaque attachement à la signature du Titulaire lors de sa prise ; les signatures des deux parties lui donnent un caractère contradictoire et opposable, sans exclure les autres cas du 7.1.",
    "page": 36
  },
  {
    "id": "refusal_reservations_pv",
    "title": "Refus ou réserves : joindre un PV",
    "text": "Si le Titulaire présent refuse de signer ou signe avec réserves, dresser un procès-verbal de présentation de l’attachement et des circonstances. Le PV, signé ou non des deux parties, est annexé aux documents concernés.",
    "page": 36
  },
  {
    "id": "observations",
    "title": "Observations écrites sous dix jours",
    "text": "En cas de refus ou de réserves, le Titulaire dispose de dix jours à compter de la présentation pour formuler par écrit ses observations ; passé le délai sans observations, le texte considère l’attachement accepté sans réserve.",
    "page": 36
  },
  {
    "id": "emergency",
    "title": "Constat en situation d’urgence",
    "text": "En urgence, possibilité de demander au MOE de missionner un commissaire de justice ; attachement réalisé par lui ou sous son contrôle annoncé de même valeur qu’un attachement cosigné. Préférer informer le Titulaire de ce recours.",
    "page": 37
  },
  {
    "id": "transmit",
    "title": "Transmettre dans les sept jours calendaires",
    "text": "Le signataire transmet l’original au MOE sous sept jours calendaires après signature pour classement au dossier d’exécution. Copies dans le même délai au Titulaire et à l’entité de suivi du marché, qui conserve sa copie au dossier marché.",
    "page": 37
  },
  {
    "id": "no_force_majeure",
    "title": "Événement exceptionnel : rester factuel",
    "text": "Pour un événement exceptionnel, consigner les faits et conséquences ; ne jamais mentionner le terme « force majeure » dans l’attachement.",
    "page": 39
  },
  {
    "id": "real_dimensions",
    "title": "Relever les dimensions réelles",
    "text": "Inscrire les dimensions réelles des fouilles même si le marché prévoit une rémunération au cube théorique ou conventionnel ; selon ce mode toutes les dimensions peuvent ne pas être nécessaires.",
    "page": 40
  },
  {
    "id": "not_daily_report",
    "title": "Rapport journalier et attachement distincts",
    "text": "Ne pas transformer le rapport journalier du surveillant SNCF en attachement : il contient des renseignements n’ayant pas ce caractère.",
    "page": 42
  },
  {
    "id": "excluded_exception",
    "title": "Vérifier si le fait relève d’un attachement",
    "text": "Les exemples du tableau 2 ne doivent pas donner lieu à un attachement, sauf exigence expresse du Titulaire.",
    "page": 42
  }
];

export const SOURCES = [
  {
    "title": "RGF00099 — Fiche 7 Les attachements (art. 12 du CCG T)",
    "pages": "33 à 37",
    "version": "Version 01 du 03/03/2026 — extrait fourni"
  },
  {
    "title": "RGF00099 — Tableaux 1 et 2 : faits à constater et exclusions",
    "pages": "38 à 43",
    "version": "Version 01 du 03/03/2026 — extrait fourni"
  },
  {
    "title": "Modèle fourni — Attachement vierge",
    "pages": "Feuille type",
    "version": "Document Word transmis par l’utilisateur"
  }
];

export const FIELD_PROMPTS = {
  "debut_reel": [
    "Relever : date os.",
    "Relever : date réelle constatée."
  ],
  "intemperies_total": [
    "Relever : début.",
    "Relever : fin.",
    "Relever : vent.",
    "Relever : température.",
    "Relever : précipitations.",
    "Relever : indicateur mesuré."
  ],
  "intemperies_partiel": [
    "Relever : début.",
    "Relever : fin.",
    "Relever : parties interrompues.",
    "Relever : phénomène observé."
  ],
  "limitation_dates": [
    "Relever : début.",
    "Relever : fin.",
    "Relever : limitation.",
    "Relever : localisation.",
    "Relever : clause référence."
  ],
  "reprise_reelle": [
    "Relever : date os.",
    "Relever : date réelle."
  ],
  "repliement": [
    "Relever : date.",
    "Relever : installations.",
    "Relever : clause référence."
  ],
  "restitution_emplacements": [
    "Relever : date.",
    "Relever : emplacements.",
    "Relever : délai contractuel de référence."
  ],
  "fin_travaux": [
    "Relever : date.",
    "Relever : périmètre constaté."
  ],
  "greve_sncf": [
    "Relever : date.",
    "Relever : préavis.",
    "Relever : incidence factuelle.",
    "Relever : opérations affectées."
  ],
  "greve_titulaire": [
    "Relever : début.",
    "Relever : fin.",
    "Relever : incidences factuelles."
  ],
  "ltv_longueur": [
    "Relever : longueur.",
    "Relever : localisation.",
    "Relever : dates.",
    "Relever : mesure de référence."
  ],
  "ltv_taux": [
    "Relever : vitesse avant.",
    "Relever : vitesse constatée.",
    "Relever : localisation.",
    "Relever : dates."
  ],
  "arret_technique": [
    "Relever : faits.",
    "Relever : début.",
    "Relever : mesures observées.",
    "Relever : reprise."
  ],
  "ajournement": [
    "Relever : faits.",
    "Relever : début.",
    "Relever : mesures."
  ],
  "evenement_exceptionnel": [
    "Quel fait a été constaté, à quelle date et en quel lieu ?",
    "Quels ouvrages, moyens ou opérations ont été effectivement affectés ?",
    "Quelles conséquences matérielles ont été constatées ?",
    "Quelles photos, mesures ou pièces documentent ces faits ?"
  ],
  "retard_plans": [
    "Relever : document.",
    "Relever : date attendue de référence.",
    "Relever : date de réception réelle.",
    "Relever : incidences factuelles."
  ],
  "retard_fournitures": [
    "Relever : nature.",
    "Relever : date attendue.",
    "Relever : date réelle.",
    "Relever : quantités constatées."
  ],
  "plans_reference": [
    "Relever : référence.",
    "Relever : version.",
    "Relever : partie d’ouvrage.",
    "Relever : constats."
  ],
  "materiel_onereux": [
    "Relever : type.",
    "Relever : caractéristiques.",
    "Relever : nombre.",
    "Relever : mise à disposition.",
    "Relever : restitution."
  ],
  "location_titulaire": [
    "Relever : matériel.",
    "Relever : caractéristiques.",
    "Relever : périodes."
  ],
  "fournitures_onereuses": [
    "Relever : nature.",
    "Relever : quantité réelle.",
    "Relever : clause référence."
  ],
  "materiaux_restitues": [
    "Relever : nature.",
    "Relever : quantité.",
    "Relever : unité.",
    "Relever : dépose.",
    "Relever : restitution."
  ],
  "interceptions": [
    "Relever : date.",
    "Relever : accordé de.",
    "Relever : accordé à.",
    "Relever : utilisé de.",
    "Relever : utilisé à.",
    "Relever : non utilisé."
  ],
  "consignations": [
    "Relever : référence 9005/9007.",
    "Relever : périmètre.",
    "Relever : horaires."
  ],
  "pertes_externes": [
    "Quels horaires de début et de fin ont été constatés ?",
    "Quels travaux et moyens ont été concernés ?",
    "Quelle cause le Titulaire a-t-il invoquée, en l’attribuant clairement à sa déclaration ?",
    "Quels faits le représentant de la MOE a-t-il directement observés ?"
  ],
  "pertes_titulaire": [
    "Relever : date.",
    "Relever : horaires.",
    "Relever : conditions observées.",
    "Relever : travaux concernés."
  ],
  "conditions_particulieres": [
    "Relever : date.",
    "Relever : horaires.",
    "Relever : conditions réelles.",
    "Relever : conditions de référence."
  ],
  "ecart_forfait_cache": [
    "Relever : ouvrage.",
    "Relever : localisation.",
    "Relever : référence.",
    "Relever : dimensions.",
    "Relever : quantités mesurées."
  ],
  "nature_terrain": [
    "Relever : localisation.",
    "Relever : profondeur.",
    "Relever : nature observée.",
    "Relever : photos."
  ],
  "dimensions_fouilles": [
    "Où se situe chaque fouille (voie, PK, ouvrage ou repère) ?",
    "Quelles sont les dimensions réelles mesurées et leurs unités ?",
    "Comment les mesures ont-elles été relevées, et par qui ?",
    "Quels croquis et photos permettent de retrouver chaque mesure ?"
  ],
  "traction": [
    "Relever : nombre.",
    "Relever : type.",
    "Relever : puissance.",
    "Relever : début.",
    "Relever : fin."
  ],
  "transport_terres": [
    "Relever : chargement.",
    "Relever : déchargement.",
    "Relever : mode.",
    "Relever : distance.",
    "Relever : quantité mesurée."
  ],
  "manutention": [
    "Relever : nature.",
    "Relever : quantité.",
    "Relever : mode.",
    "Relever : distance.",
    "Relever : horaires."
  ],
  "cote_eau": [
    "Relever : localisation.",
    "Relever : date.",
    "Relever : cote.",
    "Relever : référentiel altimétrique."
  ],
  "pompage": [
    "Relever : début.",
    "Relever : fin.",
    "Relever : durée relevée.",
    "Relever : matériel.",
    "Relever : caractéristiques."
  ],
  "ouvrages_provisoires": [
    "Relever : nature.",
    "Relever : localisation.",
    "Relever : dates.",
    "Relever : dimensions réelles."
  ],
  "phases_provisoires": [
    "Relever : phase.",
    "Relever : localisation.",
    "Relever : dates.",
    "Relever : constats."
  ],
  "transports_seuil": [
    "Relever : mode.",
    "Relever : quantité mesurée.",
    "Relever : distance.",
    "Relever : seuil contractuel de référence."
  ],
  "degarnissage": [
    "Relever : lieu.",
    "Relever : date.",
    "Relever : quantité.",
    "Relever : référence marché."
  ],
  "materiel_ferroviaire": [
    "Relever : nature.",
    "Relever : nombre.",
    "Relever : caractéristiques.",
    "Relever : mise à disposition.",
    "Relever : restitution."
  ],
  "bourrage": [
    "Quelles zones et PK ont été traités ?",
    "Quelles périodes d’intervention ont réellement été accordées ?",
    "Quels dispositifs d’enregistrement étaient présents et lesquels ont connu une défaillance ?",
    "Quels ripages, relevages et références de piquetage ont été relevés ?",
    "Le nivellement a-t-il été réalisé sur une base absolue ou relative ?",
    "Quels travaux divers ont été effectivement exécutés ?"
  ],
  "trains_travaux": [
    "Relever : date.",
    "Relever : train.",
    "Relever : mise à disposition de.",
    "Relever : mise à disposition à.",
    "Relever : utilisation réelle de.",
    "Relever : utilisation réelle à."
  ],
  "origine_delai": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "remise_documents": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "remise_securite": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "constat_materialite": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "rapport_journalier": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "cr_chantier": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "journal_chantier": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "proces_verbal": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "avis_travaux": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "carnets_depeches": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "justification_delai": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "modification_technique": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ],
  "essais_techniques": [
    "Consigner la demande expresse du Titulaire et sa date.",
    "Décrire uniquement les faits effectivement constatés.",
    "Référencer le document ou la procédure normalement applicable."
  ]
};

