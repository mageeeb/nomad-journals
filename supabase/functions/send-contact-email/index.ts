import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email from:", email, "Name:", name);

    // Envoyer l'email à votre adresse
    const emailResponse = await resend.emails.send({
      from: "Contact Travel Blog <onboarding@resend.dev>",
      to: ["nanouchkaly@yahoo.fr"],
      subject: `Nouveau message de contact de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Nouveau message de contact
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #007bff;">Informations du contact :</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
          </div>
          
          <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #333;">Message :</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #d4edda; border-radius: 8px; border: 1px solid #c3e6cb;">
            <p style="margin: 0; color: #155724; font-size: 14px;">
              <strong>Note :</strong> Vous pouvez répondre directement à cet email. 
              L'adresse de réponse sera automatiquement définie sur : ${email}
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            Ce message a été envoyé depuis le formulaire de contact de votre blog de voyage.
          </p>
        </div>
      `,
      reply_to: email, // Permet de répondre directement à la personne qui a écrit
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email envoyé avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);