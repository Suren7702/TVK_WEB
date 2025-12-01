// models/PartyUnit.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const PartyUnitSchema = new Schema(
    {
        // Name of the unit in Tamil (required for validation)
        nameTa: {
            type: String,
            required: [true, 'Unit name is required.'],
            trim: true,
        },
        // Type of the unit (union, village, ward, booth)
        type: {
            type: String,
            enum: ['union', 'village', 'ward', 'booth'],
            required: [true, 'Unit type is required.'],
            lowercase: true,
        },
        // Reference to the parent unit (null for 'union')
        parentId: {
            type: Types.ObjectId,
            default: null,
            index: true,
            // ref: 'PartyUnit' // Optional: If you want to enforce a Mongoose reference
        },
        // Person's Name (The office bearer)
        person: {
            type: String,
            default: '',
            trim: true,
        },
        // Person's Role (The role of the office bearer in Tamil)
        roleTa: {
            type: String,
            default: '',
            trim: true,
        },
        // Contact Phone Number
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        // Photo (Stores the Base64 string of the image)
        photo: {
            type: String, 
            default: '',
        },
    },
    { timestamps: true }
);

const PartyUnit = model('PartyUnit', PartyUnitSchema);

export default PartyUnit;