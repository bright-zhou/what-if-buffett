import type { YearData } from '../types';

/**
 * Annual returns: Berkshire Hathaway per-share market value vs S&P 500 (with
 * dividends).
 *
 * Source: Berkshire Hathaway 2025 Annual Report, pp.19-20 ("Berkshire's
 * Performance vs. the S&P 500" table).
 *
 * Note: 1965 & 1966 are for the 12 months ended Sep 30; 1967 is for the 15
 * months ended Dec 31. All other years are calendar years.
 *
 * Values are decimal returns:
 *   49.5% → 0.495,  -3.4% → -0.034
 */
export const YEARS: readonly YearData[] = [
  { year: 1965, buffettReturn: 0.495, sp500Return: 0.100 },
  { year: 1966, buffettReturn: -0.034, sp500Return: -0.117 },
  { year: 1967, buffettReturn: 0.133, sp500Return: 0.309 },
  { year: 1968, buffettReturn: 0.778, sp500Return: 0.110 },
  { year: 1969, buffettReturn: 0.194, sp500Return: -0.084 },
  { year: 1970, buffettReturn: -0.046, sp500Return: 0.039 },
  { year: 1971, buffettReturn: 0.805, sp500Return: 0.146 },
  { year: 1972, buffettReturn: 0.081, sp500Return: 0.189 },
  { year: 1973, buffettReturn: -0.025, sp500Return: -0.148 },
  { year: 1974, buffettReturn: -0.487, sp500Return: -0.264 },
  { year: 1975, buffettReturn: 0.025, sp500Return: 0.372 },
  { year: 1976, buffettReturn: 1.293, sp500Return: 0.236 },
  { year: 1977, buffettReturn: 0.468, sp500Return: -0.074 },
  { year: 1978, buffettReturn: 0.145, sp500Return: 0.064 },
  { year: 1979, buffettReturn: 1.025, sp500Return: 0.182 },
  { year: 1980, buffettReturn: 0.328, sp500Return: 0.323 },
  { year: 1981, buffettReturn: 0.318, sp500Return: -0.050 },
  { year: 1982, buffettReturn: 0.384, sp500Return: 0.214 },
  { year: 1983, buffettReturn: 0.690, sp500Return: 0.224 },
  { year: 1984, buffettReturn: -0.027, sp500Return: 0.061 },
  { year: 1985, buffettReturn: 0.937, sp500Return: 0.316 },
  { year: 1986, buffettReturn: 0.142, sp500Return: 0.186 },
  { year: 1987, buffettReturn: 0.046, sp500Return: 0.051 },
  { year: 1988, buffettReturn: 0.593, sp500Return: 0.166 },
  { year: 1989, buffettReturn: 0.846, sp500Return: 0.317 },
  { year: 1990, buffettReturn: -0.231, sp500Return: -0.031 },
  { year: 1991, buffettReturn: 0.356, sp500Return: 0.305 },
  { year: 1992, buffettReturn: 0.298, sp500Return: 0.076 },
  { year: 1993, buffettReturn: 0.389, sp500Return: 0.101 },
  { year: 1994, buffettReturn: 0.250, sp500Return: 0.013 },
  { year: 1995, buffettReturn: 0.574, sp500Return: 0.376 },
  { year: 1996, buffettReturn: 0.062, sp500Return: 0.230 },
  { year: 1997, buffettReturn: 0.349, sp500Return: 0.334 },
  { year: 1998, buffettReturn: 0.522, sp500Return: 0.286 },
  { year: 1999, buffettReturn: -0.199, sp500Return: 0.210 },
  { year: 2000, buffettReturn: 0.266, sp500Return: -0.091 },
  { year: 2001, buffettReturn: 0.065, sp500Return: -0.119 },
  { year: 2002, buffettReturn: -0.038, sp500Return: -0.221 },
  { year: 2003, buffettReturn: 0.158, sp500Return: 0.287 },
  { year: 2004, buffettReturn: 0.043, sp500Return: 0.109 },
  { year: 2005, buffettReturn: 0.008, sp500Return: 0.049 },
  { year: 2006, buffettReturn: 0.241, sp500Return: 0.158 },
  { year: 2007, buffettReturn: 0.287, sp500Return: 0.055 },
  { year: 2008, buffettReturn: -0.318, sp500Return: -0.370 },
  { year: 2009, buffettReturn: 0.027, sp500Return: 0.265 },
  { year: 2010, buffettReturn: 0.214, sp500Return: 0.151 },
  { year: 2011, buffettReturn: -0.047, sp500Return: 0.021 },
  { year: 2012, buffettReturn: 0.168, sp500Return: 0.160 },
  { year: 2013, buffettReturn: 0.327, sp500Return: 0.324 },
  { year: 2014, buffettReturn: 0.270, sp500Return: 0.137 },
  { year: 2015, buffettReturn: -0.125, sp500Return: 0.014 },
  { year: 2016, buffettReturn: 0.234, sp500Return: 0.120 },
  { year: 2017, buffettReturn: 0.219, sp500Return: 0.218 },
  { year: 2018, buffettReturn: 0.028, sp500Return: -0.044 },
  { year: 2019, buffettReturn: 0.110, sp500Return: 0.315 },
  { year: 2020, buffettReturn: 0.024, sp500Return: 0.184 },
  { year: 2021, buffettReturn: 0.296, sp500Return: 0.287 },
  { year: 2022, buffettReturn: 0.040, sp500Return: -0.181 },
  { year: 2023, buffettReturn: 0.158, sp500Return: 0.263 },
  { year: 2024, buffettReturn: 0.255, sp500Return: 0.250 },
  { year: 2025, buffettReturn: 0.109, sp500Return: 0.179 },
];
