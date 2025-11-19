/**
 * Types and interfaces for grant scraping system
 */

export interface ScrapedGrant {
  title: string;
  description: string;
  agency: string;
  category: string;
  valueMin: number | null;
  valueMax: number | null;
  deadline: Date | null;
  status: "OPEN" | "CLOSED" | "UPCOMING";
  eligibilityCriteria: any;
  keywords: string[];
  applicationUrl?: string;
  sourceUrl: string;
  externalId?: string;
}

export interface GrantScraper {
  name: string;
  scrape(): Promise<ScrapedGrant[]>;
}

export interface ScrapeResult {
  source: string;
  grantsFound: number;
  grantsCreated: number;
  grantsUpdated: number;
  errors: string[];
  timestamp: Date;
}
