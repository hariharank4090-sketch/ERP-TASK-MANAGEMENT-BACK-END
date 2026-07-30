import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { noData, dataFound, servError } from '../../responseObject';
import { ISOString } from '../../helper_functions';
import { getDbConnection } from '../base.controller';

export const StaffBasedReport = async (req: Request, res: Response) => {
    try {
        const { Fromdate, Todate } = req.query;

        // Date validation: fallback to today if invalid
        const isValidDate = (d: any) => d && !isNaN(new Date(d).getTime());

        const fromDate = isValidDate(Fromdate) ? ISOString(Fromdate as string) : ISOString();
        const toDate = isValidDate(Todate) ? ISOString(Todate as string) : ISOString();

        const db = getDbConnection(req);

        const recordset = await db.query(
            `EXEC Reporting_Online_Stock_Journal_Item_VW @Fromdate = :fromDate, @Todate = :toDate`,
            {
                replacements: { fromDate, toDate },
                type: QueryTypes.SELECT
            }
        );

        if (!recordset || !recordset.length) return noData(res);

        dataFound(res, recordset);
    } catch (error) {
        servError(error, res);
    }
}