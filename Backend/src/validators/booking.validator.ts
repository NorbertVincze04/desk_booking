export interface BookingCommandRequest {
  table_name: string;
  operation: "READ" | "CREATE" | "UPDATE" | "DELETE";
  data?: {
    id?: number;
    user_name?: string;
    booking_date?: string;
    booking_desk?: string;
  };
}

export function validateBookingCommand(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.table_name || data.table_name !== "BOOKINGS_TABLE") {
    errors.push("wrong table name");
  }

  if (
    !data.operation ||
    !["READ", "CREATE", "UPDATE", "DELETE"].includes(data.operation)
  ) {
    errors.push("wrong operation");
  }

  if (data.operation === "CREATE") {
    if (!data.data?.user_name) {
      errors.push("user_name is required");
    }
    if (!data.data?.booking_date) {
      errors.push("booking_date is required");
    }
    if (!data.data?.booking_desk) {
      errors.push("booking_desk is required");
    }
  }

  if (["UPDATE", "DELETE"].includes(data.operation)) {
    if (!data.data?.id) {
      errors.push("id is required");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
