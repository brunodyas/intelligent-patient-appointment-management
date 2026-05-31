export const questions = [
    "1. To clarify the customer's expectations for the product/service functionality: What specific temperature range are you aiming for in your living room, and how much do you want to reduce the glare on your TV?",
    "2. To confirm the specific customer preferences and any customization they require: Are you looking for any specific features or customizations for the window treatments in your living room to address the heat and glare issue?",
    "3. To identify any potential installation challenges based on the provided details: Have you already identified any obstacles, such as furniture or layout restrictions, that might affect the installation of window treatments to address the heat and glare in your living room?",
    "4. To ensure customer satisfaction: Are there any additional areas in your home where you are experiencing similar issues, or any other specific preferences or concerns that you would like us to address during the appointment?",
    "5. To understand the current conditions: Have you made any recent changes to the layout or interior design of your living room that may be contributing to the heat and glare issues?",
];

export enum BlindOptions {
  INDOOR = "Indoor",
  OUTDOOR = "Outdoor",
  KEEP_LIGHT_OUT = "Keep the Light Out",
  LET_LIGHT_IN = "Let the Light In",
  LIFT_AND_LOWER = "Lift and Lower",
  ROTATE_OPEN_CLOSED = "Rotate Open and Closed",
  SLIDE_SIDE_TO_SIDE = "Slide Side to Side",
  YES = "Yes",
  NO = "No"
}

export enum BlindTypes {
  AWNINGS = "Awnings",
  CELLULAR_SHADES = "Cellular Shades",
  DRAPERY = "Drapery",
  EXTERIOR_ROLLER_SHADES = "Exterior Roller Shades",
  FAUX_WOOD_BLINDS = "Faux Wood Blinds",
  GOOD_FOR_DOORS = "Good for Doors",
  PLEATED_SHADES = "Pleated Shades",
  ROLLER_SHADES = "Roller Shades",
  ROMAN_SHADES = "Roman Shades",
  SHUTTERS = "Shutters",
  WOOD_BLINDS = "Wood Blinds",
  WOVEN_WOOD_NATURAL_GRASS_SHADES = "Woven Wood/Natural Grass Shades"
}

export interface Question {
  question: string;
  options: string[];
  blinds: { [key: string]: string[] };
}

export const questionsData: Question[] = [
  {
      question: "Where is it going",
      options: [BlindOptions.INDOOR, BlindOptions.OUTDOOR],
      blinds: {
          "Indoor": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY],
          "Outdoor": [BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS, BlindTypes.GOOD_FOR_DOORS],
      }
  },
  {
      question: "How do you want to open it",
      options: [BlindOptions.ROTATE_OPEN_CLOSED, BlindOptions.LIFT_AND_LOWER, BlindOptions.SLIDE_SIDE_TO_SIDE],
      blinds: {
          "Rotate Open and Closed": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS],
          "Lift and Lower": [BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES],
          "Slide Side to Side": [BlindTypes.CELLULAR_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY],
      }
  },
  {
      question: "Light control",
      options: [BlindOptions.LET_LIGHT_IN, BlindOptions.KEEP_LIGHT_OUT],
      blinds: {
          "Let the Light In": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
          "Keep the Light Out": [BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY],
      }
  },
  {
      question: "Can be motorized",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
          "No": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS],
      }
  },
  {
      question: "See-thru when closed",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES],
          "No": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS],
      }
  },
  {
      question: 'Considered "low cost"',
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES],
          "No": [BlindTypes.SHUTTERS, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
      }
  },
  {
      question: "Can be curved to fit an arched window",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.SHUTTERS, BlindTypes.CELLULAR_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY],
          "No": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.ROLLER_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
      }
  },
  {
      question: "Good for wet environments/high humidity",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
          "No": [BlindTypes.WOOD_BLINDS, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY],
      }
  },
  {
      question: "Controlling heat/cold through a window",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.SHUTTERS, BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
          "No": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES],
      }
  },
  {
      question: "Product is in your view when open",
      options: [BlindOptions.YES, BlindOptions.NO],
      blinds: {
          "Yes": [BlindTypes.WOOD_BLINDS, BlindTypes.FAUX_WOOD_BLINDS, BlindTypes.SHUTTERS],
          "No": [BlindTypes.ROLLER_SHADES, BlindTypes.CELLULAR_SHADES, BlindTypes.PLEATED_SHADES, BlindTypes.ROMAN_SHADES, BlindTypes.WOVEN_WOOD_NATURAL_GRASS_SHADES, BlindTypes.DRAPERY, BlindTypes.EXTERIOR_ROLLER_SHADES, BlindTypes.AWNINGS],
      }
  },
]
