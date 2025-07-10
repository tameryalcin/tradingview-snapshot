#!/usr/bin/env node

import { readdirSync, statSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Screenshots directory
const screenshotsDir = join(__dirname, "screenshots");

// Cleanup function to delete screenshots older than 12 hours
const cleanupOldScreenshots = () => {
  try {
    const files = readdirSync(screenshotsDir);
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    
    files.forEach(file => {
      if (file.endsWith('.png')) {
        const filePath = join(screenshotsDir, file);
        const stats = statSync(filePath);
        
        if (stats.mtime < twelveHoursAgo) {
          unlinkSync(filePath);
          deletedCount++;
          console.log(`${new Date().toISOString()} - Deleted old screenshot: ${file}`);
        }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`${new Date().toISOString()} - Cleanup completed: ${deletedCount} old screenshots deleted`);
    } else {
      console.log(`${new Date().toISOString()} - No old screenshots to delete`);
    }
  } catch (error) {
    console.error(`${new Date().toISOString()} - Error during cleanup:`, error);
  }
};

// Run cleanup
cleanupOldScreenshots();