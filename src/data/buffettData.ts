import type { YearData } from '../types';

/**
 * Annual returns: Berkshire Hathaway vs S&P 500 (with dividends).
 *
 * Source: Berkshire Hathaway Annual Reports (1965–2024).
 * 2025 values are best estimates.
 *
 * Values are decimal returns:
 *   23.7% → 0.237,  -11.5% → -0.115
 */
export const YEARS: YearData[] = [
  { year: 1965, buffettReturn: 0.237, sp500Return: 0.100 },
  { year: 1966, buffettReturn: -0.115, sp500Return: -0.117 },
  { year: 1967, buffettReturn: 0.319, sp500Return: 0.309 },
  { year: 1968, buffettReturn: 0.590, sp500Return: 0.110 },
  { year: 1969, buffettReturn: 0.005, sp500Return: -0.084 },
  { year: 1970, buffettReturn: 0.120, sp500Return: 0.039 },
  { year: 1971, buffettReturn: 0.164, sp500Return: 0.146 },
  { year: 1972, buffettReturn: 0.217, sp500Return: 0.189 },
  { year: 1973, buffettReturn: 0.047, sp500Return: -0.148 },
  { year: 1974, buffettReturn: -0.058, sp500Return: -0.264 },
  { year: 1975, buffettReturn: 0.319, sp500Return: 0.372 },
  { year: 1976, buffettReturn: 0.593, sp500Return: 0.236 },
  { year: 1977, buffettReturn: 0.319, sp500Return: -0.074 },
  { year: 1978, buffettReturn: 0.240, sp500Return: 0.064 },
  { year: 1979, buffettReturn: 0.357, sp500Return: 0.182 },
  { year: 1980, buffettReturn: 0.193, sp500Return: 0.323 },
  { year: 1981, buffettReturn: 0.314, sp500Return: -0.050 },
  { year: 1982, buffettReturn: 0.400, sp500Return: 0.214 },
  { year: 1983, buffettReturn: 0.323, sp500Return: 0.224 },
  { year: 1984, buffettReturn: 0.136, sp500Return: 0.061 },
  { year: 1985, buffettReturn: 0.482, sp500Return: 0.316 },
  { year: 1986, buffettReturn: 0.142, sp500Return: 0.186 },
  { year: 1987, buffettReturn: 0.195, sp500Return: 0.051 },
  { year: 1988, buffettReturn: 0.140, sp500Return: 0.166 },
  { year: 1989, buffettReturn: 0.444, sp500Return: 0.317 },
  { year: 1990, buffettReturn: 0.074, sp500Return: -0.031 },
  { year: 1991, buffettReturn: 0.396, sp500Return: 0.305 },
  { year: 1992, buffettReturn: 0.203, sp500Return: 0.076 },
  { year: 1993, buffettReturn: 0.389, sp500Return: 0.101 },
  { year: 1994, buffettReturn: 0.250, sp500Return: 0.013 },
  { year: 1995, buffettReturn: 0.575, sp500Return: 0.376 },
  { year: 1996, buffettReturn: 0.062, sp500Return: 0.230 },
  { year: 1997, buffettReturn: 0.341, sp500Return: 0.334 },
  { year: 1998, buffettReturn: 0.145, sp500Return: 0.286 },
  { year: 1999, buffettReturn: -0.051, sp500Return: 0.210 },
  { year: 2000, buffettReturn: 0.266, sp500Return: -0.091 },
  { year: 2001, buffettReturn: 0.065, sp500Return: -0.119 },
  { year: 2002, buffettReturn: -0.100, sp500Return: -0.221 },
  { year: 2003, buffettReturn: 0.160, sp500Return: 0.287 },
  { year: 2004, buffettReturn: 0.219, sp500Return: 0.109 },
  { year: 2005, buffettReturn: 0.008, sp500Return: 0.049 },
  { year: 2006, buffettReturn: 0.241, sp500Return: 0.158 },
  { year: 2007, buffettReturn: 0.110, sp500Return: 0.055 },
  { year: 2008, buffettReturn: -0.096, sp500Return: -0.370 },
  { year: 2009, buffettReturn: 0.027, sp500Return: 0.265 },
  { year: 2010, buffettReturn: 0.214, sp500Return: 0.151 },
  { year: 2011, buffettReturn: -0.047, sp500Return: 0.021 },
  { year: 2012, buffettReturn: 0.170, sp500Return: 0.160 },
  { year: 2013, buffettReturn: 0.327, sp500Return: 0.324 },
  { year: 2014, buffettReturn: 0.270, sp500Return: 0.137 },
  { year: 2015, buffettReturn: 0.064, sp500Return: 0.014 },
  { year: 2016, buffettReturn: 0.234, sp500Return: 0.120 },
  { year: 2017, buffettReturn: 0.230, sp500Return: 0.218 },
  { year: 2018, buffettReturn: 0.004, sp500Return: -0.044 },
  { year: 2019, buffettReturn: 0.110, sp500Return: 0.315 },
  { year: 2020, buffettReturn: 0.024, sp500Return: 0.184 },
  { year: 2021, buffettReturn: 0.296, sp500Return: 0.287 },
  { year: 2022, buffettReturn: 0.040, sp500Return: -0.181 },
  { year: 2023, buffettReturn: 0.340, sp500Return: 0.262 },
  { year: 2024, buffettReturn: 0.350, sp500Return: 0.250 },
  { year: 2025, buffettReturn: 0.200, sp500Return: 0.150 }, // estimated
];
