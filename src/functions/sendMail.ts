import { GSContext, GSDataSource, GSStatus } from '@godspeedsystems/core';

export default async function (ctx: GSContext, args: any) {
  const {
    inputs: {
      data: { body },
    },
  } = ctx;

  const { to, subject, text, html, from } = body;

  // Access the SendGrid datasource from the context
  const ds: GSDataSource = ctx.datasources.sendgrid;

  try {
    // Validate required fields before attempting to send the email
    if (!to || !subject || !text || !html) {
      const missingFields = [
        !to && 'to',
        !subject && 'subject',
        !text && 'text',
        !html && 'html',
      ]
        .filter(Boolean)
        .join(', ');

      ctx.childLogger.error(`Missing required fields: ${missingFields}`);
      return new GSStatus(
        false,
        400,
        `Missing required fields: ${missingFields}`,
      );
    }

    // Execute the send function in SendGrid
    const response = await ds.execute(ctx, {
      to,
      subject,
      text,
      html,
      from: from || undefined,
      meta: { fnNameInWorkflow: 'datasource.sendgrid.sendMail' },
    });

    return response;
  } catch (error: unknown) {
    // Log and handle known and unknown errors
    if (error instanceof Error) {
      ctx.childLogger.error(`Failed to send email: ${error.message}`);
      return new GSStatus(false, 500, 'Failed to send email', error.message);
    }

    // Handle non-standard errors
    ctx.childLogger.error(`An unknown error occurred: ${error}`);
    return new GSStatus(false, 500, 'Failed to send email', `${error}`);
  }
}
