const path = require("path")
const { PDFParse } = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

let standardFontDataUrl = path.resolve(__dirname, "..", "..", "node_modules", "pdfjs-dist", "standard_fonts")
standardFontDataUrl = standardFontDataUrl.replace(/\\/g, "/")
if (!standardFontDataUrl.endsWith("/")) {
    standardFontDataUrl += "/"
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */

const generateInterViewReportController = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                message: "Resume PDF file is required."
            })
        }

        const parser = new PDFParse({
            data: req.file.buffer,
            standardFontDataUrl,
        })

        const resumeParsed = await parser.getText()
        await parser.destroy()

        const resumeText = typeof resumeParsed === "string" ? resumeParsed : resumeParsed?.text || ""
        const { selfDescription, jobDescription } = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            title: interViewReportByAi.title || interViewReportByAi.job_role || jobDescription || "Interview Report",
            ...interViewReportByAi
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Failed to generate interview report:", error)

        const statusCode = Number(error?.status || error?.statusCode || error?.response?.status || 0)
        const isAiUnavailable = [429, 502, 503, 504].includes(statusCode) || ["RESOURCE_EXHAUSTED", "UNAVAILABLE", "DEADLINE_EXCEEDED", "ABORTED"].includes(error?.code || error?.status)
        const status = statusCode === 429 || error?.code === "RESOURCE_EXHAUSTED" ? 429 : isAiUnavailable ? 503 : 500

        return res.status(status).json({
            message: status === 503 ? "The AI model is temporarily unavailable. Please try again after a moment." : "Unable to generate interview report.",
            error: error.message || error.toString()
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}
module.exports={
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}