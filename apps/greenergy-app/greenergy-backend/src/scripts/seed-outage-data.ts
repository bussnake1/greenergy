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
    return ['UnavailabilityPGTimeSeries', 'UnavailabilityPGPoint', 'Available_Period'].includes(name);
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
 * Helper function to safely extract values from the flattened XML structure
 */
function extractValue(obj: any, key: string, defaultValue: any = '') {
  // Direct property access
  if (obj[key] !== undefined) {
    return obj[key];
  }
  
  // For properties with attributes (with '#text' and '_codingScheme')
  if (obj[key] && obj[key]['#text'] !== undefined) {
    return obj[key]['#text'];
  }
  
  return defaultValue;
}

/**
 * Helper function to extract coding scheme and text value
 */
function extractWithCodingScheme(obj: any, key: string, defaultValue: string = '') {
  if (obj[key] && obj[key]['#text'] !== undefined && obj[key]._codingScheme !== undefined) {
    return `${obj[key]._codingScheme}:${obj[key]['#text']}`;
  }
  return extractValue(obj, key, defaultValue);
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
    
    // Extract the root element (MarketDocument)
    const doc = result.Unavailability_MarketDocument;
    
    if (!doc) {
      console.warn(`No Unavailability_MarketDocument found in ${filePath}`);
      return;
    }
    
    // Debug: Log the document structure
    console.log('Document structure:');
    console.log(inspectObject(doc, 6));
    
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
    
    // Create or update UnavailabilityPGMarketDocument
    const unavailabilityPGMarketDocument = await prisma.unavailabilityPGMarketDocument.upsert({
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
    
    // Process UnavailabilityPGTimeSeries
    const unavailabilityPGTimeSeriesArray = Array.isArray(doc.TimeSeries) 
      ? doc.TimeSeries 
      : doc.TimeSeries ? [doc.TimeSeries] : [];
    
    for (const ts of unavailabilityPGTimeSeriesArray) {
      // Debug: Log the UnavailabilityPGTimeSeries object
      console.log('UnavailabilityPGTimeSeries object:', inspectObject(ts, 4));
      
      // Extract start and end times with more flexible approach
      let startDateTime = null;
      let endDateTime = null;
      
      // Approach 1: Direct properties with flattened property names
      if (ts['start_DateAndOrTime.date'] && ts['start_DateAndOrTime.time']) {
        startDateTime = parseISODate(`${ts['start_DateAndOrTime.date']}T${ts['start_DateAndOrTime.time']}`);
      }
      
      if (ts['end_DateAndOrTime.date'] && ts['end_DateAndOrTime.time']) {
        endDateTime = parseISODate(`${ts['end_DateAndOrTime.date']}T${ts['end_DateAndOrTime.time']}`);
      }
      
      // Approach 2: If we have the document time interval, use that as fallback
      if (!startDateTime && timeInterval?.start) {
        startDateTime = parseISODate(timeInterval.start);
        console.log(`Using document time interval start for UnavailabilityPGTimeSeries ${ts.mRID}`);
      }
      
      if (!endDateTime && timeInterval?.end) {
        endDateTime = parseISODate(timeInterval.end);
        console.log(`Using document time interval end for UnavailabilityPGTimeSeries ${ts.mRID}`);
      }
      
      if (!startDateTime || !endDateTime) {
        console.warn(`Missing start or end time in UnavailabilityPGTimeSeries ${ts.mRID} - skipping`);
        continue;
      }
      
      console.log(`UnavailabilityPGTimeSeries ${ts.mRID} time range: ${startDateTime.toISOString()} - ${endDateTime.toISOString()}`);
      
      // Create UnavailabilityPGTimeSeries record
      const unavailabilityPGTimeSeries = await prisma.unavailabilityPGTimeSeries.create({
        data: {
          mRID: String(ts.mRID), // Convert mRID to string
          businessType: extractValue(ts, 'businessType'),
          biddingZone: extractWithCodingScheme(ts, 'biddingZone_Domain.mRID'),
          startTime: startDateTime,
          endTime: endDateTime,
          quantityUnit: extractValue(ts, 'quantity_Measure_Unit.name', 'MAW'),
          curveType: extractValue(ts, 'curveType'),
          resourceMRID: extractWithCodingScheme(ts, 'production_RegisteredResource.mRID'),
          resourceName: extractValue(ts, 'production_RegisteredResource.name'),
          resourceLocation: extractValue(ts, 'production_RegisteredResource.location.name'),
          resourceType: extractValue(ts, 'production_RegisteredResource.pSRType.psrType'),
          powerSystemMRID: extractWithCodingScheme(ts, 'production_RegisteredResource.pSRType.powerSystemResources.mRID'),
          powerSystemName: extractValue(ts, 'production_RegisteredResource.pSRType.powerSystemResources.name'),
          nominalPower: (() => {
            const nominalP = ts['production_RegisteredResource.pSRType.powerSystemResources.nominalP'];
            if (!nominalP) return null;
            
            // Handle case where nominalP has unit attribute and text value
            if (nominalP['#text'] !== undefined) {
              return parseFloat(nominalP['#text']);
            }
            
            // Handle case where nominalP is just a number
            return typeof nominalP === 'number' ? nominalP : 
                   typeof nominalP === 'string' ? parseFloat(nominalP) : null;
          })(),
          nominalPowerUnit: (() => {
            const nominalP = ts['production_RegisteredResource.pSRType.powerSystemResources.nominalP'];
            return nominalP && nominalP._unit ? nominalP._unit : 'MAW';
          })(),
          unavailabilityPGMarketDocumentId: unavailabilityPGMarketDocument.id,
        },
      });
      
      // Process Available_Period
      const unavailabilityPGAvailablePeriods = Array.isArray(ts.Available_Period) 
        ? ts.Available_Period 
        : ts.Available_Period ? [ts.Available_Period] : [];
      
      for (const period of unavailabilityPGAvailablePeriods) {
        if (!period.timeInterval?.start || !period.timeInterval?.end) {
          console.warn(`Missing time interval in Available_Period`);
          continue;
        }
        
        // Create UnavailabilityPGAvailablePeriod record
        const unavailabilityPGAvailablePeriod = await prisma.unavailabilityPGAvailablePeriod.create({
          data: {
            startTime: parseISODate(period.timeInterval.start),
            endTime: parseISODate(period.timeInterval.end),
            resolution: period.resolution,
            unavailabilityPGTimeSeriesId: unavailabilityPGTimeSeries.id,
          },
        });
        
        // Process UnavailabilityPGPoint
        const unavailabilityPGPoints = Array.isArray(period.Point) 
          ? period.Point 
          : period.Point ? [period.Point] : [];
        
        for (const unavailabilityPGPoint of unavailabilityPGPoints) {
          // Create UnavailabilityPGPoint record
          await prisma.unavailabilityPGPoint.create({
            data: {
              position: parseInt(unavailabilityPGPoint.position),
              quantity: parseFloat(unavailabilityPGPoint.quantity),
              unavailabilityPGAvailablePeriodId: unavailabilityPGAvailablePeriod.id,
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
    const existingDocuments = await prisma.unavailabilityPGMarketDocument.count();
    
    if (existingDocuments > 0) {
      console.log('Database already contains market documents. Clearing existing data...');
      // Delete all existing data in reverse order of dependencies
      await prisma.unavailabilityPGPoint.deleteMany({});
      await prisma.unavailabilityPGAvailablePeriod.deleteMany({});
      await prisma.unavailabilityPGTimeSeries.deleteMany({});
      await prisma.unavailabilityPGMarketDocument.deleteMany({});
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
