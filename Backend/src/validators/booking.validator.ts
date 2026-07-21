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
    errors.push('table_name is required and must be "BOOKINGS_TABLE"');
  }

  if (
    !data.operation ||
    !["READ", "CREATE", "UPDATE", "DELETE"].includes(data.operation)
  ) {
    errors.push(
      "operation is required and must be READ, CREATE, UPDATE, or DELETE",
    );
  }

  if (data.operation === "CREATE") {
    if (!data.data?.user_name) {
      errors.push("user_name is required for CREATE operation");
    }
    if (!data.data?.booking_date) {
      errors.push("booking_date is required for CREATE operation");
    }
    if (!data.data?.booking_desk) {
      errors.push("booking_desk is required for CREATE operation");
    }
  }

  if (["UPDATE", "DELETE"].includes(data.operation)) {
    if (!data.data?.id) {
      errors.push("id is required for UPDATE and DELETE operations");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
