import Papa from 'papaparse';
import { Trade } from '../types';
import { parse } from 'date-fns';

export const parseCSV = (csvContent: string): Trade[] => {
  try {
    const { data } = Papa.parse(csvContent, { header: true });
    return data.map((row: any) => {
      const parsedTime = parseDate(row.time);
      if (!parsedTime) {
        console.error(`Invalid date format: ${row.time}`);
        return null;
      }
      return {
        time: parsedTime,
        coin: row.coin,
        dir: row.dir,
        px: parseFloat(row.px),
        sz: parseFloat(row.sz),
        ntl: parseFloat(row.ntl),
        fee: parseFloat(row.fee),
        closedPnl: parseFloat(row.closedPnl),
      };
    }).filter((trade): trade is Trade => trade !== null);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

const parseDate = (dateString: string): Date | null => {
  const formats = [
    'dd/MM/yyyy - HH:mm:ss',
    'yyyy-MM-dd HH:mm:ss',
    'MM/dd/yyyy HH:mm:ss',
    'dd/MM/yyyy HH:mm:ss',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
  ];

  for (const format of formats) {
    try {
      const parsedDate = parse(dateString, format, new Date());
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (error) {
      // Continue to the next format if parsing fails
    }
  }

  return null;
};