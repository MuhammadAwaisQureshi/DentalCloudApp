import { gapi } from 'gapi-script';

// ===================================
// GOOGLE SHEETS CONFIGURATION
// ===================================

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY_HERE';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const SHEET_TABS = {
  patients: 'Patients',
  appointments: 'Appointments',
  treatments: 'Treatments',
  prescriptions: 'Prescriptions',
  billing: 'Finance',
  lab: 'LabWork',
  ortho: 'Orthodontics',
  expenses: 'Expenses',
  settings: 'Settings',
};

// ===================================
// GOOGLE API CLIENT
// ===================================

class GoogleSheetsAPI {
  private spreadsheetId: string = '';
  private isInitialized: boolean = false;
  private isSignedIn: boolean = false;

  async init(spreadsheetId: string): Promise<void> {
    try {
      this.spreadsheetId = spreadsheetId;

      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
              scope: SCOPES,
            });

            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.isSignedIn.listen((signedIn: boolean) => {
              this.isSignedIn = signedIn;
            });

            this.isSignedIn = authInstance.isSignedIn.get();
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      throw new Error('Failed to connect to Google Sheets. Please check your internet connection.');
    }
  }

  async signIn(): Promise<void> {
    if (!this.isInitialized) throw new Error('API not initialized. Call init() first.');
    try {
      await gapi.auth2.getAuthInstance().signIn();
      this.isSignedIn = true;
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw new Error('Failed to sign in to Google. Please try again.');
    }
  }

  async signOut(): Promise<void> {
    try {
      await gapi.auth2.getAuthInstance().signOut();
      this.isSignedIn = false;
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }

  isUserSignedIn(): boolean {
    return this.isSignedIn;
  }

  async loadTable(tabName: keyof typeof SHEET_TABS): Promise<any[]> {
    if (!this.isSignedIn) throw new Error('Not signed in. Please sign in first.');
    try {
      const sheetName = SHEET_TABS[tabName];
      const range = `${sheetName}!A:Z`;

      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      const rows = response.result.values || [];
      if (rows.length === 0) return [];

      const headers = rows[0];
      const data = rows.slice(1);

      return data.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error(`Failed to load ${tabName}:`, error);
      if (!navigator.onLine) throw new Error('You are offline. Please check your internet connection.');
      throw new Error(`Failed to load data from ${tabName}. Please try again.`);
    }
  }

  async appendRow(tabName: keyof typeof SHEET_TABS, data: { [key: string]: any }): Promise<void> {
    if (!this.isSignedIn) throw new Error('Not signed in. Please sign in first.');
    try {
      const sheetName = SHEET_TABS[tabName];

      const headersResponse = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });

      const headers = headersResponse.result.values?.[0] || [];
      const row = headers.map((header: string) => data[header] || '');

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] },
      });
    } catch (error) {
      console.error(`Failed to append to ${tabName}:`, error);
      if (!navigator.onLine) throw new Error('You are offline. Changes will be saved locally.');
      throw new Error(`Failed to save to ${tabName}. Please try again.`);
    }
  }

  async updateRow(tabName: keyof typeof SHEET_TABS, id: string, data: { [key: string]: any }): Promise<void> {
    if (!this.isSignedIn) throw new Error('Not signed in. Please sign in first.');
    try {
      const sheetName = SHEET_TABS[tabName];
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = response.result.values || [];
      if (rows.length === 0) throw new Error('Sheet is empty');

      const headers = rows[0];
      const idColumnIndex = headers.indexOf('id');
      if (idColumnIndex === -1) throw new Error('ID column not found');

      const rowIndex = rows.findIndex(row => row[idColumnIndex] === id);
      if (rowIndex === -1) throw new Error(`Row with ID ${id} not found`);

      const updatedRow = headers.map((header: string, index: number) => data.hasOwnProperty(header) ? data[header] : rows[rowIndex][index] || '');
      const range = `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`;

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedRow] },
      });
    } catch (error) {
      console.error(`Failed to update ${tabName}:`, error);
      if (!navigator.onLine) throw new Error('You are offline. Changes will be saved locally.');
      throw new Error(`Failed to update ${tabName}. Please try again.`);
    }
  }

  async batchUpdate(tabName: keyof typeof SHEET_TABS, updates: Array<{ id: string; data: { [key: string]: any } }>): Promise<void> {
    if (!this.isSignedIn) throw new Error('Not signed in. Please sign in first.');
    try {
      for (const update of updates) {
        await this.updateRow(tabName, update.id, update.data);
      }
    } catch (error) {
      console.error(`Failed to batch update ${tabName}:`, error);
      throw error;
    }
  }

  async setupNewSpreadsheet(): Promise<void> {
    if (!this.isSignedIn) throw new Error('Not signed in. Please sign in first.');
    try {
      const tabHeaders: { [key: string]: string[] } = {
        Patients: ['id', 'name', 'phone', 'age', 'gender', 'occupation', 'behaviorTag', 'medicalHistory', 'legacyBalance', 'totalDue', 'createdAt'],
        Appointments: ['id', 'date', 'time', 'patientId', 'patientName', 'type', 'status', 'notes', 'createdAt'],
        Treatments: ['id', 'patientId', 'toothNumbers', 'treatmentName', 'costPKR', 'status', 'dateAdded', 'dateCompleted', 'notes'],
        Prescriptions: ['id', 'patientId', 'patientName', 'medications', 'date', 'notes'],
        Finance: ['id', 'patientId', 'patientName', 'amount', 'discount', 'total', 'paid', 'balance', 'date', 'paymentMethod'],
        LabWork: ['id', 'patientId', 'patientName', 'itemName', 'labName', 'cost', 'dateSent', 'expectedReturn', 'status'],
        Orthodontics: ['id', 'patientId', 'patientName', 'installment', 'materialCost', 'visitingDoctorShare', 'drAhmedShare', 'paymentDate', 'settlementStatus'],
        Expenses: ['id', 'category', 'description', 'amount', 'date', 'paymentMethod', 'notes'],
        Settings: ['key', 'value'],
      };

      const requests = Object.entries(tabHeaders).map(([sheetName, headers]) => ({
        range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        values: [headers],
      }));

      await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: requests },
      });

      console.log('Spreadsheet setup complete!');
    } catch (error) {
      console.error('Failed to setup spreadsheet:', error);
      throw new Error('Failed to setup spreadsheet. Please check permissions.');
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isSignedIn) return false;
    try {
      await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Settings!A1:B1',
      });
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }
}

// ===================================
// SINGLETON INSTANCE
// ===================================

export const GAPI = new GoogleSheetsAPI();

// ===================================
// UTILITY FUNCTIONS
// ===================================

export const isOnline = (): boolean => navigator.onLine;

export const getConnectionStatus = async (): Promise<string> => {
  if (!isOnline()) return '🔴 Offline - Working in local mode';
  if (!GAPI.isUserSignedIn()) return '🟡 Not connected to Google Sheets';
  const connected = await GAPI.checkConnection();
  return connected ? '🟢 Connected to Google Sheets' : '🔴 Connection lost';
};

export const safeAPICall = async <T>(operation: () => Promise<T>, fallback?: T): Promise<T> => {
  try {
    if (!isOnline()) {
      if (fallback !== undefined) return fallback;
      throw new Error('You are offline. Please check your internet connection.');
    }
    return await operation();
  } catch (error: any) {
    console.error('API call failed:', error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
};

export default GAPI;
