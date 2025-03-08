const { PrismaClient } = require('@prisma/client');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');
const util = require('util');

const prisma = new PrismaClient();

// XML parsing options
interface ParserOptions {
  ignoreAttributes: boolean;
  attributeNamePrefix: string;
  isArray: (name: string) => boolean;
  ignoreNameSpace: boolean;
  parseAttributeValue: boolean;
  allowBooleanAttributes: boolean;
  removeNSPrefix: boolean;
  processEntities: boolean;
  htmlEntities: boolean;
}

const parserOptions: ParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '_',
  isArray: (name: string) => {
    return ['TimeSeries', 'Point', 'Available_Period'].includes(name);
  },
  // Enhanced namespace handling
  ignoreNameSpace: false,
  parseAttributeValue: true,
  allowBooleanAttributes: true,
  removeNSPrefix: true,
  processEntities: true,
  htmlEntities: true
};

const parser = new XMLParser(parserOptions);

// Path to XML files
const XML_DIR = path.resolve(
  __dirname,
  '..',
  'assets',
  'Unavailability of Production and Generation Units_202501010000-202502020000'
);

/**
 * Helper function to deeply inspect an object
 */
function inspectObject(obj: any, depth = 4) {
  return util.inspect(obj, { depth, colors: false, showHidden: false });
}

/**
 * Safely access nested properties in an object
 */
function getNestedProperty(obj: any, path: any) {
  if (!obj) return undefined;
  
  // Handle both dot notation and array of keys
  const keys = Array.isArray(path) ? path : path.split('.');
  
  return keys.reduce((o: any, key: any) => (o && typeof o === 'object' ? o[key] : undefined), obj);
}

/**
 * Parse ISO date string to Date object
 */
function parseISODate(dateString: any) {
  return new Date(dateString);
}

/**
 * Process a single XML file
 */
async function processXmlFile(filePath: string) {
  console.log(`Processing file: ${filePath}`);
  
  try {
    // Read and parse XML file
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    const result = parser.parse(xmlData);
    
    // Debug: Log the structure of the parsed XML
    console.log(`XML Structure for ${path.basename(filePath)}:`);
    console.log(inspectObject(result, 2));
    
    // Extract the root element (Unavailability_MarketDocument)
    const doc = result.Unavailability_MarketDocument;
    
    if (!doc) {
      console.warn(`No Unavailability_MarketDocument found in ${filePath}`);
      return;
    }
    
    // Debug: Log the document structure
    console.log('Document structure:');
    console.log(inspectObject(doc, 2));
    
    // Try multiple approaches to find the time interval
    let timeInterval = null;
    
    // Approach 1: Direct property access
    if (doc.unavailability_Time_Period && doc.unavailability_Time_Period.timeInterval) {
      timeInterval = doc.unavailability_Time_Period.timeInterval;
    } 
    // Approach 2: Try alternative property names
    else if (doc['unavailability_Time_Period.timeInterval']) {
      timeInterval = doc['unavailability_Time_Period.timeInterval'];
    }
    // Approach 3: Search for properties containing 'timeInterval'
    else {
      for (const key in doc) {
        if (key.includes('timeInterval')) {
          timeInterval = doc[key];
          break;
        }
        
        // Check one level deeper
        if (doc[key] && typeof doc[key] === 'object') {
          for (const subKey in doc[key]) {
            if (subKey.includes('timeInterval')) {
              timeInterval = doc[key][subKey];
              break;
            }
          }
          if (timeInterval) break;
        }
      }
    }
    
    if (!timeInterval) {
      console.warn(`No time interval found in ${filePath}`);
      return;
    }
    
    console.log('Found time interval:', timeInterval);
    
    // Create or update MarketDocument
    const marketDocument = await prisma.marketDocument.upsert({
      where: { mRID: doc.mRID },
      update: {
        revisionNumber: parseInt(doc.revisionNumber),
        type: doc.type,
        processType: doc['process.processType'],
        createdAt: parseISODate(doc.createdDateTime),
        startTime: parseISODate(timeInterval.start),
        endTime: parseISODate(timeInterval.end),
        reasonCode: doc.Reason?.code,
      },
      create: {
        mRID: doc.mRID,
        revisionNumber: parseInt(doc.revisionNumber),
        type: doc.type,
        processType: doc['process.processType'],
        createdAt: parseISODate(doc.createdDateTime),
        startTime: parseISODate(timeInterval.start),
        endTime: parseISODate(timeInterval.end),
        reasonCode: doc.Reason?.code,
      },
    });
    
    // Process TimeSeries
    const timeSeriesArray = Array.isArray(doc.TimeSeries) 
      ? doc.TimeSeries 
      : doc.TimeSeries ? [doc.TimeSeries] : [];
    
    for (const ts of timeSeriesArray) {
      // Debug: Log the TimeSeries object
      console.log('TimeSeries object:', inspectObject(ts, 3));
      
      // Extract start and end times with more flexible approach
      let startDateTime = null;
      let endDateTime = null;
      
      // Approach 1: Direct properties
      if (ts.start_DateAndOrTime?.date && ts.start_DateAndOrTime?.time) {
        startDateTime = parseISODate(`${ts.start_DateAndOrTime.date}T${ts.start_DateAndOrTime.time}`);
      }
      
      if (ts.end_DateAndOrTime?.date && ts.end_DateAndOrTime?.time) {
        endDateTime = parseISODate(`${ts.end_DateAndOrTime.date}T${ts.end_DateAndOrTime.time}`);
      }
      
      // Approach 2: If we have the document time interval, use that as fallback
      if (!startDateTime && timeInterval?.start) {
        startDateTime = parseISODate(timeInterval.start);
        console.log(`Using document time interval start for TimeSeries ${ts.mRID}`);
      }
      
      if (!endDateTime && timeInterval?.end) {
        endDateTime = parseISODate(timeInterval.end);
        console.log(`Using document time interval end for TimeSeries ${ts.mRID}`);
      }
      
      if (!startDateTime || !endDateTime) {
        console.warn(`Missing start or end time in TimeSeries ${ts.mRID} - skipping`);
        continue;
      }
      
      console.log(`TimeSeries ${ts.mRID} time range: ${startDateTime.toISOString()} - ${endDateTime.toISOString()}`);
      
      // Create TimeSeries record
      const timeSeries = await prisma.timeSeries.create({
        data: {
          mRID: String(ts.mRID), // Convert mRID to string
          businessType: ts.businessType,
          biddingZone: ts.biddingZone_Domain?.mRID?._codingScheme 
            ? `${ts.biddingZone_Domain.mRID._codingScheme}:${ts.biddingZone_Domain.mRID['#text']}` 
            : ts.biddingZone_Domain?.mRID || '',
          startTime: startDateTime,
          endTime: endDateTime,
          quantityUnit: ts.quantity_Measure_Unit?.name || 'MAW',
          curveType: ts.curveType,
          resourceMRID: ts.production_RegisteredResource?.mRID?._codingScheme 
            ? `${ts.production_RegisteredResource.mRID._codingScheme}:${ts.production_RegisteredResource.mRID['#text']}` 
            : ts.production_RegisteredResource?.mRID || '',
          resourceName: ts.production_RegisteredResource?.name || '',
          resourceLocation: ts.production_RegisteredResource?.location?.name,
          resourceType: ts.production_RegisteredResource?.pSRType?.psrType,
          powerSystemMRID: ts.production_RegisteredResource?.pSRType?.powerSystemResources?.mRID?._codingScheme 
            ? `${ts.production_RegisteredResource.pSRType.powerSystemResources.mRID._codingScheme}:${ts.production_RegisteredResource.pSRType.powerSystemResources.mRID['#text']}` 
            : ts.production_RegisteredResource?.pSRType?.powerSystemResources?.mRID,
          powerSystemName: ts.production_RegisteredResource?.pSRType?.powerSystemResources?.name,
          nominalPower: ts.production_RegisteredResource?.pSRType?.powerSystemResources?.nominalP?._unit 
            ? parseFloat(ts.production_RegisteredResource.pSRType.powerSystemResources.nominalP['#text']) 
            : ts.production_RegisteredResource?.pSRType?.powerSystemResources?.nominalP 
              ? parseFloat(ts.production_RegisteredResource.pSRType.powerSystemResources.nominalP) 
              : null,
          nominalPowerUnit: ts.production_RegisteredResource?.pSRType?.powerSystemResources?.nominalP?._unit || 'MAW',
          marketDocumentId: marketDocument.id,
        },
      });
      
      // Process Available_Period
      const availablePeriods = Array.isArray(ts.Available_Period) 
        ? ts.Available_Period 
        : ts.Available_Period ? [ts.Available_Period] : [];
      
      for (const period of availablePeriods) {
        if (!period.timeInterval?.start || !period.timeInterval?.end) {
          console.warn(`Missing time interval in Available_Period`);
          continue;
        }
        
        // Create AvailablePeriod record
        const availablePeriod = await prisma.availablePeriod.create({
          data: {
            startTime: parseISODate(period.timeInterval.start),
            endTime: parseISODate(period.timeInterval.end),
            resolution: period.resolution,
            timeSeriesId: timeSeries.id,
          },
        });
        
        // Process Point
        const points = Array.isArray(period.Point) 
          ? period.Point 
          : period.Point ? [period.Point] : [];
        
        for (const point of points) {
          // Create Point record
          await prisma.point.create({
            data: {
              position: parseInt(point.position),
              quantity: parseFloat(point.quantity),
              availablePeriodId: availablePeriod.id,
            },
          });
        }
      }
    }
    
    console.log(`Successfully processed file: ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Main function to seed the database
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Check if database is already seeded
    const existingDocuments = await prisma.marketDocument.count();
    
    if (existingDocuments > 0) {
      console.log('Database already contains market documents. Clearing existing data...');
      // Delete all existing data in reverse order of dependencies
      await prisma.point.deleteMany({});
      await prisma.availablePeriod.deleteMany({});
      await prisma.timeSeries.deleteMany({});
      await prisma.marketDocument.deleteMany({});
      console.log('Existing data cleared. Proceeding with seeding...');
    }
    
    // Get all XML files
    const files = fs.readdirSync(XML_DIR)
      .filter((file: string) => file.endsWith('.xml'))
      .map((file: string) => path.join(XML_DIR, file));
    
    console.log(`Found ${files.length} XML files to process`);
    
    // Process each file
    for (const file of files) {
      await processXmlFile(file);
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDatabase()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
