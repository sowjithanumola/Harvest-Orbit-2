import { HistoricalData } from "../types";

export class NasaService {
    static async fetchNasaData(lat: string, lon: string, days: number = 14): Promise<HistoricalData[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const formatNASA = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
        const startStr = formatNASA(startDate);
        const endStr = formatNASA(endDate);

        // TS = Earth Skin Temperature (Land Surface Temp)
        // T2M = Air Temperature at 2 Meters
        // RH2M = Relative Humidity at 2 Meters
        // PRECTOTCORR = Precipitation Corrected
        // ALLSKY_SFC_SW_DWN = All Sky Surface Shortwave Downward Irradiance (Solar Radiation)
        const parameters = "T2M,TS,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN";
        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=AG&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;

        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
            throw new Error(`NASA API error: ${response.statusText}`);
        }

        const json: any = await response.json();
        if (!json.properties?.parameter) {
            return [];
        }

        const params = json.properties.parameter;
        const dates = Object.keys(params.T2M).sort().reverse();
        const sanitize = (val: any) => (val === undefined || val === null || val < -900) ? 0 : val;

        return dates.map(date => ({
            date,
            airTemp: sanitize(params.T2M[date]),
            surfaceTemp: sanitize(params.TS[date]),
            humidity: sanitize(params.RH2M[date]),
            precip: sanitize(params.PRECTOTCORR[date]),
            solarRadiation: sanitize(params.ALLSKY_SFC_SW_DWN[date])
        }));
    }
}
