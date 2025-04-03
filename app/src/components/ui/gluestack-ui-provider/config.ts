"use client";
import { vars } from "nativewind";

export const colors = {
  light: {
    /* Primary - Based on #3d9ae2 (Flax Flower Blue) */
    "--color-primary-0": "236 245 255",
    "--color-primary-50": "220 238 254",
    "--color-primary-100": "204 229 253",
    "--color-primary-200": "173 212 250",
    "--color-primary-300": "141 194 246",
    "--color-primary-400": "110 177 242",
    "--color-primary-500": "61 154 226",
    "--color-primary-600": "49 123 181",
    "--color-primary-700": "41 103 151",
    "--color-primary-800": "33 82 121",
    "--color-primary-900": "27 66 97",
    "--color-primary-950": "18 44 64",

    /* Secondary - Ultra-Faint Blue (#F9FCFE) */
    "--color-secondary-0": "255 255 255",
    "--color-secondary-50": "252 253 255",
    "--color-secondary-100": "249 251 254",
    "--color-secondary-200": "243 247 253",
    "--color-secondary-300": "236 243 251",
    "--color-secondary-400": "225 236 248",
    "--color-secondary-500": "210 226 242",
    "--color-secondary-600": "180 206 228",
    "--color-secondary-700": "148 173 193",
    "--color-secondary-800": "119 140 157",
    "--color-secondary-900": "96 113 127",
    "--color-secondary-950": "64 75 84",

    /* Tertiary - Based on #809be7 (Blue Cue) */
    "--color-tertiary-0": "241 245 254",
    "--color-tertiary-50": "235 241 252",
    "--color-tertiary-100": "224 233 250",
    "--color-tertiary-200": "198 213 246",
    "--color-tertiary-300": "165 187 240",
    "--color-tertiary-400": "141 168 235",
    "--color-tertiary-500": "128 155 231",
    "--color-tertiary-600": "102 124 185",
    "--color-tertiary-700": "85 103 154",
    "--color-tertiary-800": "68 83 123",
    "--color-tertiary-900": "51 62 92",
    "--color-tertiary-950": "34 41 62",

    /* Error */
    "--color-error-0": "254 242 242",
    "--color-error-50": "254 226 226",
    "--color-error-100": "254 202 202",
    "--color-error-200": "252 165 165",
    "--color-error-300": "248 113 113",
    "--color-error-400": "239 68 68",
    "--color-error-500": "220 38 38",
    "--color-error-600": "185 28 28",
    "--color-error-700": "153 27 27",
    "--color-error-800": "127 29 29",
    "--color-error-900": "91 21 21",
    "--color-error-950": "63 14 14",

    /* Success */
    "--color-success-0": "236 253 245",
    "--color-success-50": "217 249 232",
    "--color-success-100": "190 242 215",
    "--color-success-200": "146 232 184",
    "--color-success-300": "96 219 148",
    "--color-success-400": "52 196 121",
    "--color-success-500": "34 166 99",
    "--color-success-600": "31 138 85",
    "--color-success-700": "29 115 71",
    "--color-success-800": "27 91 57",
    "--color-success-900": "24 75 49",
    "--color-success-950": "15 50 32",

    /* Warning */
    "--color-warning-0": "255 250 236",
    "--color-warning-50": "255 246 217",
    "--color-warning-100": "254 240 194",
    "--color-warning-200": "254 226 150",
    "--color-warning-300": "252 211 99",
    "--color-warning-400": "250 191 47",
    "--color-warning-500": "236 171 21",
    "--color-warning-600": "202 138 4",
    "--color-warning-700": "161 103 7",
    "--color-warning-800": "133 77 14",
    "--color-warning-900": "113 63 18",
    "--color-warning-950": "74 39 9",

    /* Info */
    "--color-info-0": "245 251 255",
    "--color-info-50": "237 246 255",
    "--color-info-100": "221 238 255",
    "--color-info-200": "189 219 255",
    "--color-info-300": "151 199 255",
    "--color-info-400": "100 170 255",
    "--color-info-500": "61 154 226",
    "--color-info-600": "49 123 181",
    "--color-info-700": "41 103 151",
    "--color-info-800": "33 82 121",
    "--color-info-900": "27 66 97",
    "--color-info-950": "18 44 64",

    /* Typography */
    "--color-typography-0": "255 255 255",
    "--color-typography-50": "246 246 246",
    "--color-typography-100": "229 229 229",
    "--color-typography-200": "212 212 212",
    "--color-typography-300": "189 189 189",
    "--color-typography-400": "163 163 163",
    "--color-typography-500": "115 115 115",
    "--color-typography-600": "82 82 82",
    "--color-typography-700": "54 69 79",
    "--color-typography-800": "43 55 63",
    "--color-typography-900": "29 37 42",
    "--color-typography-950": "14 18 21",

    /* Outline */
    "--color-outline-0": "255 255 255",
    "--color-outline-50": "243 243 243",
    "--color-outline-100": "230 230 230",
    "--color-outline-200": "220 220 220",
    "--color-outline-300": "210 210 210",
    "--color-outline-400": "163 163 163",
    "--color-outline-500": "140 140 140",
    "--color-outline-600": "115 115 115",
    "--color-outline-700": "82 82 82",
    "--color-outline-800": "64 64 64",
    "--color-outline-900": "38 38 38",
    "--color-outline-950": "23 23 23",

    /* Background */
    "--color-background-0": "255 255 255",
    "--color-background-50": "246 246 246",
    "--color-background-100": "240 240 240",
    "--color-background-200": "230 235 240",
    "--color-background-300": "213 213 213",
    "--color-background-400": "189 189 189",
    "--color-background-500": "140 140 140",
    "--color-background-600": "115 115 115",
    "--color-background-700": "82 82 82",
    "--color-background-800": "54 69 79",
    "--color-background-900": "36 46 53",
    "--color-background-950": "14 18 21",

    /* Background Special */
    "--color-background-error": "254 242 242",
    "--color-background-warning": "255 250 236",
    "--color-background-success": "236 253 245",
    "--color-background-muted": "245 245 245",
    "--color-background-info": "245 251 255",

    /* Focus Ring Indicator */
    "--color-indicator-primary": "61 154 226",
    "--color-indicator-info": "189 219 255",
    "--color-indicator-error": "185 28 28",
  },
  dark: {
    /* Primary - Based on #3d9ae2 (Flax Flower Blue) */
    "--color-primary-0": "18 44 64",
    "--color-primary-50": "27 66 97",
    "--color-primary-100": "33 82 121",
    "--color-primary-200": "41 103 151",
    "--color-primary-300": "49 123 181",
    "--color-primary-400": "61 154 226",
    "--color-primary-500": "110 177 242",
    "--color-primary-600": "141 194 246",
    "--color-primary-700": "173 212 250",
    "--color-primary-800": "204 229 253",
    "--color-primary-900": "220 238 254",
    "--color-primary-950": "236 245 255",

    /* Secondary - Based on #36454f (Azul Petróleo) */
    "--color-secondary-0": "14 18 21",
    "--color-secondary-50": "21 27 31",
    "--color-secondary-100": "29 37 42",
    "--color-secondary-200": "36 46 53",
    "--color-secondary-300": "43 55 63",
    "--color-secondary-400": "54 69 79",
    "--color-secondary-500": "103 115 127",
    "--color-secondary-600": "147 159 171",
    "--color-secondary-700": "179 188 196",
    "--color-secondary-800": "202 210 217",
    "--color-secondary-900": "218 224 230",
    "--color-secondary-950": "230 235 240",

    /* Tertiary - Based on #809be7 (Blue Cue) */
    "--color-tertiary-0": "34 41 62",
    "--color-tertiary-50": "51 62 92",
    "--color-tertiary-100": "68 83 123",
    "--color-tertiary-200": "85 103 154",
    "--color-tertiary-300": "102 124 185",
    "--color-tertiary-400": "128 155 231",
    "--color-tertiary-500": "141 168 235",
    "--color-tertiary-600": "165 187 240",
    "--color-tertiary-700": "198 213 246",
    "--color-tertiary-800": "224 233 250",
    "--color-tertiary-900": "235 241 252",
    "--color-tertiary-950": "241 245 254",

    /* Error */
    "--color-error-0": "63 14 14",
    "--color-error-50": "91 21 21",
    "--color-error-100": "127 29 29",
    "--color-error-200": "153 27 27",
    "--color-error-300": "185 28 28",
    "--color-error-400": "220 38 38",
    "--color-error-500": "239 68 68",
    "--color-error-600": "248 113 113",
    "--color-error-700": "252 165 165",
    "--color-error-800": "254 202 202",
    "--color-error-900": "254 226 226",
    "--color-error-950": "254 242 242",

    /* Success */
    "--color-success-0": "15 50 32",
    "--color-success-50": "24 75 49",
    "--color-success-100": "27 91 57",
    "--color-success-200": "29 115 71",
    "--color-success-300": "31 138 85",
    "--color-success-400": "34 166 99",
    "--color-success-500": "52 196 121",
    "--color-success-600": "96 219 148",
    "--color-success-700": "146 232 184",
    "--color-success-800": "190 242 215",
    "--color-success-900": "217 249 232",
    "--color-success-950": "236 253 245",

    /* Warning */
    "--color-warning-0": "74 39 9",
    "--color-warning-50": "113 63 18",
    "--color-warning-100": "133 77 14",
    "--color-warning-200": "161 103 7",
    "--color-warning-300": "202 138 4",
    "--color-warning-400": "236 171 21",
    "--color-warning-500": "250 191 47",
    "--color-warning-600": "252 211 99",
    "--color-warning-700": "254 226 150",
    "--color-warning-800": "254 240 194",
    "--color-warning-900": "255 246 217",
    "--color-warning-950": "255 250 236",

    /* Info - Based on #bddbff (Dithered Sky) */
    "--color-info-0": "18 44 64",
    "--color-info-50": "27 66 97",
    "--color-info-100": "33 82 121",
    "--color-info-200": "41 103 151",
    "--color-info-300": "49 123 181",
    "--color-info-400": "61 154 226",
    "--color-info-500": "100 170 255",
    "--color-info-600": "151 199 255",
    "--color-info-700": "189 219 255",
    "--color-info-800": "221 238 255",
    "--color-info-900": "237 246 255",
    "--color-info-950": "245 251 255",

    /* Typography */
    "--color-typography-0": "14 18 21",
    "--color-typography-50": "29 37 42",
    "--color-typography-100": "43 55 63",
    "--color-typography-200": "54 69 79",
    "--color-typography-300": "82 82 82",
    "--color-typography-400": "115 115 115",
    "--color-typography-500": "163 163 163",
    "--color-typography-600": "189 189 189",
    "--color-typography-700": "212 212 212",
    "--color-typography-800": "229 229 229",
    "--color-typography-900": "246 246 246",
    "--color-typography-950": "255 255 255",

    /* Outline */
    "--color-outline-0": "14 18 21",
    "--color-outline-50": "29 37 42",
    "--color-outline-100": "43 55 63",
    "--color-outline-200": "54 69 79",
    "--color-outline-300": "82 82 82",
    "--color-outline-400": "115 115 115",
    "--color-outline-500": "140 140 140",
    "--color-outline-600": "163 163 163",
    "--color-outline-700": "210 210 210",
    "--color-outline-800": "220 220 220",
    "--color-outline-900": "230 230 230",
    "--color-outline-950": "243 243 243",

    /* Background */
    "--color-background-0": "21 27 31",
    "--color-background-50": "29 37 42",
    "--color-background-100": "36 46 53",
    "--color-background-200": "43 55 63",
    "--color-background-300": "54 69 79",
    "--color-background-400": "82 82 82",
    "--color-background-500": "115 115 115",
    "--color-background-600": "140 140 140",
    "--color-background-700": "189 189 189",
    "--color-background-800": "213 213 213",
    "--color-background-900": "230 235 240",
    "--color-background-950": "246 246 246",

    /* Background Special */
    "--color-background-error": "77 22 22",
    "--color-background-warning": "74 54 23",
    "--color-background-success": "27 61 44",
    "--color-background-muted": "43 55 63",
    "--color-background-info": "29 53 74",

    /* Focus Ring Indicator */
    "--color-indicator-primary": "110 177 242",
    "--color-indicator-info": "189 219 255",
    "--color-indicator-error": "239 68 68",
  },
};

export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
