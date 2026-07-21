import { Router, type Request, type Response } from "express";
import { pool } from "../db.ts";

type Operation = "READ" | "CREATE" | "UPDATE" | "DELETE";

interface CommandRequest {
  table_name: string;
  operation: Operation;
  data?: {
    id?: number;
    user_name?: string;
    booking_date?: string;
    booking_desk?: string;
  };
}

export const bookingRouter = Router();

bookingRouter.post(
  "/",
  async (req: Request<{}, {}, CommandRequest>, res: Response) => {
    const { table_name, operation, data } = req.body;

    if (table_name !== "BOOKINGS_TABLE") {
      return res.status(400).json({
        success: false,
        message: "Invalid table name",
      });
    }

    try {
      switch (operation) {
        case "READ": {
          const result = await pool.query(
            `
            SELECT 
              id,
              user_name,
              booking_date,
              booking_desk
            FROM bookings
            ORDER BY booking_date ASC, booking_desk ASC
            `,
          );

          return res.json({
            success: true,
            payload: result.rows,
          });
        }

        case "CREATE": {
          if (!data?.user_name || !data?.booking_date || !data?.booking_desk) {
            return res.status(400).json({
              success: false,
              message: "Missing required booking data",
            });
          }

          const result = await pool.query(
            `
            INSERT INTO bookings 
              (user_name, booking_date, booking_desk)
            VALUES 
              ($1, $2, $3)
            RETURNING id, user_name, booking_date, booking_desk
            `,
            [data.user_name, data.booking_date, data.booking_desk],
          );

          return res.status(201).json({
            success: true,
            payload: result.rows[0],
          });
        }

        case "UPDATE": {
          if (!data?.id) {
            return res.status(400).json({
              success: false,
              message: "Missing booking id",
            });
          }

          const result = await pool.query(
            `
            UPDATE bookings
            SET 
              user_name = COALESCE($1, user_name),
              booking_date = COALESCE($2, booking_date),
              booking_desk = COALESCE($3, booking_desk)
            WHERE id = $4
            RETURNING id, user_name, booking_date, booking_desk
            `,
            [
              data.user_name ?? null,
              data.booking_date ?? null,
              data.booking_desk ?? null,
              data.id,
            ],
          );

          if (result.rowCount === 0) {
            return res.status(404).json({
              success: false,
              message: "Booking not found",
            });
          }

          return res.json({
            success: true,
            payload: result.rows[0],
          });
        }

        case "DELETE": {
          if (!data?.id) {
            return res.status(400).json({
              success: false,
              message: "Missing booking id",
            });
          }

          const result = await pool.query(
            `
            DELETE FROM bookings
            WHERE id = $1
            RETURNING id
            `,
            [data.id],
          );

          if (result.rowCount === 0) {
            return res.status(404).json({
              success: false,
              message: "Booking not found",
            });
          }

          return res.json({
            success: true,
            payload: {
              id: result.rows[0].id,
            },
          });
        }

        default: {
          return res.status(400).json({
            success: false,
            message: "Invalid operation",
          });
        }
      }
    } catch (error: any) {
      console.error("Booking operation failed:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "This desk is already booked for this date",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);
