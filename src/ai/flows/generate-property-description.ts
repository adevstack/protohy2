// This file is machine-generated - do not edit!

'use server';

/**
 * @fileOverview AI flow for generating property descriptions from key details.
 *
 * - generatePropertyDescription - A function that generates a property description.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the property.'),
  propertyType: z.string().describe('The type of property (e.g., house, apartment, condo).'),
  location: z.string().describe('The location of the property (city, state).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  areaSqFt: z.number().describe('The area of the property in square feet.'),
  amenities: z.string().describe('A comma-separated list of amenities the property offers.'),
  description: z.string().optional().describe('Additional details about the property.'),
});

export type GeneratePropertyDescriptionInput = z.infer<
  typeof GeneratePropertyDescriptionInputSchema
>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  propertyDescription: z
    .string()
    .describe('A creative and engaging description of the property.'),
});

export type GeneratePropertyDescriptionOutput = z.infer<
  typeof GeneratePropertyDescriptionOutputSchema
>;

export async function generatePropertyDescription(
  input: GeneratePropertyDescriptionInput
): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `You are a real estate marketing expert. Generate an engaging property description based on the following details:

Title: {{title}}
Property Type: {{propertyType}}
Location: {{location}}
Bedrooms: {{bedrooms}}
Bathrooms: {{bathrooms}}
Area (sq ft): {{areaSqFt}}
Amenities: {{amenities}}

Description: {{description}}

Write a compelling description that highlights the property's best features and attracts potential buyers. Focus on creating a vivid picture of what it would be like to live there.
`,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
