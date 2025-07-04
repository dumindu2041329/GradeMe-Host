var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db-connection.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const connectionString2 = process.env.DATABASE_URL;
    const client2 = postgres(connectionString2);
    db = drizzle(client2);
  }
  return db;
}
function isDbConnected() {
  try {
    return !!process.env.DATABASE_URL && db !== null;
  } catch {
    return false;
  }
}
var db;
var init_db_connection = __esm({
  "server/db-connection.ts"() {
    "use strict";
    dotenv.config();
    db = null;
  }
});

// shared/schema.ts
import { z } from "zod";
import { pgTable, serial, text, boolean, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
var userRoleEnum, examStatusEnum, users, students, exams, results, passwordResetTokens, insertUserSchema, insertStudentSchema, insertExamSchema, insertResultSchema, updateUserSchema, updateStudentSchema, loginUserSchema, studentLoginSchema, passwordUpdateSchema, notificationPreferencesSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["admin", "student"]);
    examStatusEnum = pgEnum("exam_status", ["upcoming", "active", "completed"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      role: userRoleEnum("role").notNull().default("student"),
      isAdmin: boolean("is_admin").notNull().default(false),
      profileImage: text("profile_image"),
      studentId: integer("student_id").references(() => students.id, { onDelete: "set null" }),
      emailNotifications: boolean("email_notifications").notNull().default(false),
      emailExamResults: boolean("email_exam_results").notNull().default(false),
      emailUpcomingExams: boolean("email_upcoming_exams").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    students = pgTable("students", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      class: text("class").notNull(),
      enrollmentDate: timestamp("enrollment_date").notNull().defaultNow(),
      phone: text("phone"),
      address: text("address"),
      dateOfBirth: timestamp("date_of_birth"),
      guardianName: text("guardian_name"),
      guardianPhone: text("guardian_phone"),
      profileImage: text("profile_image"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    exams = pgTable("exams", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      subject: text("subject").notNull(),
      date: timestamp("date").notNull(),
      startTime: timestamp("start_time"),
      duration: integer("duration").notNull(),
      totalMarks: integer("total_marks").notNull(),
      status: examStatusEnum("status").notNull().default("upcoming"),
      description: text("description"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    results = pgTable("results", {
      id: serial("id").primaryKey(),
      studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
      examId: integer("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
      score: decimal("score", { precision: 10, scale: 2 }).notNull(),
      percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
      submittedAt: timestamp("submitted_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: serial("id").primaryKey(),
      email: text("email").notNull(),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertUserSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      name: z.string().min(2, "Name must be at least 2 characters"),
      role: z.enum(["admin", "student"]).default("student"),
      isAdmin: z.boolean().default(false),
      profileImage: z.string().nullable().optional(),
      studentId: z.number().nullable().optional(),
      emailNotifications: z.boolean().default(true),
      smsNotifications: z.boolean().default(false),
      emailExamResults: z.boolean().default(true),
      emailUpcomingExams: z.boolean().default(true),
      smsExamResults: z.boolean().default(false),
      smsUpcomingExams: z.boolean().default(false)
    });
    insertStudentSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      class: z.string(),
      enrollmentDate: z.date().optional().default(() => /* @__PURE__ */ new Date()),
      phone: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      dateOfBirth: z.date().optional().nullable(),
      guardianName: z.string().optional().nullable(),
      guardianPhone: z.string().optional().nullable(),
      profileImage: z.string().optional().nullable()
    });
    insertExamSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      subject: z.string(),
      date: z.date(),
      startTime: z.date().optional().nullable(),
      duration: z.number().min(1, "Duration must be at least 1 minute"),
      totalMarks: z.number().min(1, "Total marks must be at least 1"),
      status: z.enum(["upcoming", "active", "completed"]).default("upcoming"),
      description: z.string().optional().nullable()
    });
    insertResultSchema = z.object({
      studentId: z.number(),
      examId: z.number(),
      score: z.number().min(0, "Score cannot be negative"),
      percentage: z.number().min(0, "Percentage cannot be negative").max(100, "Percentage cannot exceed 100"),
      submittedAt: z.date().default(() => /* @__PURE__ */ new Date())
    });
    updateUserSchema = z.object({
      name: z.string().optional(),
      email: z.string().email("Invalid email format").optional(),
      profileImage: z.string().nullable().optional(),
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      emailExamResults: z.boolean().optional(),
      emailUpcomingExams: z.boolean().optional(),
      smsExamResults: z.boolean().optional(),
      smsUpcomingExams: z.boolean().optional()
    });
    updateStudentSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      email: z.string().email("Invalid email format").optional(),
      class: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      dateOfBirth: z.date().optional().nullable(),
      guardianName: z.string().optional(),
      guardianPhone: z.string().optional(),
      profileImage: z.string().nullable().optional()
    });
    loginUserSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    studentLoginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    passwordUpdateSchema = z.object({
      currentPassword: z.string().min(6, "Password must be at least 6 characters"),
      newPassword: z.string().min(6, "Password must be at least 6 characters")
    });
    notificationPreferencesSchema = z.object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      emailExamResults: z.boolean().optional(),
      emailUpcomingExams: z.boolean().optional(),
      smsExamResults: z.boolean().optional(),
      smsUpcomingExams: z.boolean().optional()
    });
  }
});

// server/paper-file-storage.ts
var paper_file_storage_exports = {};
__export(paper_file_storage_exports, {
  PaperFileStorage: () => PaperFileStorage,
  paperFileStorage: () => paperFileStorage
});
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
var supabaseUrl, supabaseServiceKey, supabase, PaperFileStorage, paperFileStorage;
var init_paper_file_storage = __esm({
  "server/paper-file-storage.ts"() {
    "use strict";
    init_db_connection();
    init_schema();
    supabaseUrl = process.env.SUPABASE_URL || "";
    supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    PaperFileStorage = class {
      bucketName = "exam-papers";
      bucketInitialized = false;
      db = getDb();
      examNameCache = /* @__PURE__ */ new Map();
      paperCache = /* @__PURE__ */ new Map();
      cacheExpiry = 5e3;
      // 5 seconds cache
      // Removed paper caching to ensure real-time updates from storage
      constructor() {
        this.initializeBucket().catch(console.error);
      }
      async ensureBucketExists() {
        if (!this.bucketInitialized) {
          await this.initializeBucket();
        }
      }
      // Manual bucket creation for when automatic creation fails
      async createBucketManually() {
        try {
          const { data, error } = await supabase.storage.createBucket(this.bucketName, {
            public: false,
            allowedMimeTypes: ["application/json"],
            fileSizeLimit: 52428800
            // 50MB
          });
          if (error) {
            console.error("Manual bucket creation error:", error);
            return false;
          }
          this.bucketInitialized = true;
          console.log("Paper bucket created manually successfully");
          return true;
        } catch (error) {
          console.error("Manual bucket creation failed:", error);
          return false;
        }
      }
      async initializeBucket() {
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          if (listError) {
            console.error("Error listing buckets:", listError);
            return;
          }
          const bucketExists = buckets?.some((bucket) => bucket.name === this.bucketName);
          if (!bucketExists) {
            console.log(`Creating storage bucket: ${this.bucketName}`);
            const { data, error } = await supabase.storage.createBucket(this.bucketName, {
              public: false,
              allowedMimeTypes: ["application/json"],
              fileSizeLimit: 52428800
              // 50MB
            });
            if (error) {
              console.error("Error creating storage bucket:", error);
            } else {
              console.log("Storage bucket created successfully");
              this.bucketInitialized = true;
            }
          } else {
            console.log("Storage bucket already exists");
            this.bucketInitialized = true;
          }
        } catch (error) {
          console.error("Error initializing bucket:", error);
        }
      }
      async getExamName(examId) {
        if (this.examNameCache.has(examId)) {
          return this.examNameCache.get(examId);
        }
        try {
          const exam = await this.db.select().from(exams).where(eq(exams.id, examId)).limit(1);
          const examName = exam[0]?.name || `Exam ${examId}`;
          this.examNameCache.set(examId, examName);
          setTimeout(() => {
            this.examNameCache.delete(examId);
          }, 3e5);
          return examName;
        } catch (error) {
          return `Exam ${examId}`;
        }
      }
      async getFileName(examId) {
        const examName = await this.getExamName(examId);
        const sanitizedName = examName.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "_");
        return `exam_${examId}_${sanitizedName}_paper.json`;
      }
      async getPaperByExamId(examId) {
        try {
          await this.ensureBucketExists();
          const fileName = await this.getFileName(examId);
          const { data, error } = await supabase.storage.from(this.bucketName).download(fileName);
          if (error) {
            if (error.message.includes("Object not found") || error.message.includes("Bad Request") || error.originalError?.status === 400) {
              return null;
            }
            return null;
          }
          const text2 = await data.text();
          const paperData = JSON.parse(text2);
          return paperData;
        } catch (error) {
          if (error?.message?.includes("not found") || error?.message?.includes("Bad Request") || error?.status === 400) {
            return null;
          }
          return null;
        }
      }
      async savePaper(examId, paperData) {
        try {
          await this.ensureBucketExists();
          const fileName = await this.getFileName(examId);
          const examName = await this.getExamName(examId);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const existingPaper = await this.getPaperByExamId(examId);
          const calculatedTotalMarks = paperData.questions.reduce((sum, q) => sum + q.marks, 0);
          const fullPaperData = {
            id: existingPaper?.id || `paper_${examId}_${Date.now()}`,
            examId,
            ...paperData,
            totalQuestions: paperData.questions.length,
            totalMarks: calculatedTotalMarks,
            // Auto-calculate total marks
            createdAt: existingPaper?.createdAt || now,
            updatedAt: now,
            metadata: {
              examName,
              lastUpdated: now,
              version: "1.0"
            }
          };
          const { data, error } = await supabase.storage.from(this.bucketName).upload(fileName, JSON.stringify(fullPaperData, null, 2), {
            cacheControl: "3600",
            upsert: true,
            contentType: "application/json"
          });
          if (error) {
            console.error("Error saving paper:", error);
            return null;
          }
          await this.syncExamTotalMarks(examId, calculatedTotalMarks);
          this.paperCache.delete(examId);
          return fullPaperData;
        } catch (error) {
          console.error("Error saving paper:", error);
          return null;
        }
      }
      async syncExamTotalMarks(examId, totalMarks) {
        try {
          const result = await this.db.update(exams).set({ totalMarks }).where(eq(exams.id, examId)).returning();
          if (result.length > 0) {
            console.log(`\u2713 Synced exam ${examId} total marks to ${totalMarks}`);
          }
        } catch (error) {
          console.error(`Error syncing exam ${examId} total marks:`, error);
        }
      }
      async updatePaperDetails(examId, updateData) {
        try {
          const existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            const examName = await this.getExamName(examId);
            const newPaper = {
              title: updateData.title || "",
              instructions: updateData.instructions || "",
              totalQuestions: 0,
              totalMarks: 0,
              questions: []
            };
            return await this.savePaper(examId, newPaper);
          }
          const updatedPaper = {
            ...existingPaper,
            ...updateData,
            totalQuestions: existingPaper.questions.length,
            totalMarks: existingPaper.questions.reduce((sum, q) => sum + q.marks, 0)
          };
          return await this.savePaper(examId, updatedPaper);
        } catch (error) {
          console.error("Error updating paper details:", error);
          return null;
        }
      }
      async addQuestion(examId, questionData) {
        try {
          await this.ensureBucketExists();
          let existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            const examName2 = await this.getExamName(examId);
            const newPaper = await this.savePaper(examId, {
              title: `${examName2} Question Paper`,
              instructions: "Please read all questions carefully before answering.",
              totalQuestions: 0,
              totalMarks: 0,
              questions: []
            });
            if (!newPaper) {
              return null;
            }
            existingPaper = newPaper;
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const newQuestion = {
            ...questionData,
            id: `question_${examId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now
          };
          const updatedQuestions = [...existingPaper.questions, newQuestion];
          const fileName = await this.getFileName(examId);
          const examName = await this.getExamName(examId);
          const calculatedTotalMarks = updatedQuestions.reduce((sum, q) => sum + q.marks, 0);
          const fullPaperData = {
            id: existingPaper.id,
            examId,
            title: existingPaper.title,
            instructions: existingPaper.instructions,
            totalQuestions: updatedQuestions.length,
            totalMarks: calculatedTotalMarks,
            // Auto-calculate total marks
            questions: updatedQuestions,
            createdAt: existingPaper.createdAt,
            updatedAt: now,
            metadata: {
              examName,
              lastUpdated: now,
              version: "1.0"
            }
          };
          const { error } = await supabase.storage.from(this.bucketName).upload(fileName, JSON.stringify(fullPaperData, null, 2), {
            upsert: true,
            contentType: "application/json"
          });
          if (error) {
            console.error("Error saving paper:", error);
            return null;
          }
          await this.syncExamTotalMarks(examId, calculatedTotalMarks);
          this.paperCache.delete(examId);
          return newQuestion;
        } catch (error) {
          console.error("Error adding question:", error);
          return null;
        }
      }
      async updateQuestion(examId, questionId, updateData) {
        try {
          const existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            console.error("Paper not found for exam ID:", examId);
            return null;
          }
          const questionIndex = existingPaper.questions.findIndex((q) => q.id === questionId);
          if (questionIndex === -1) {
            console.error("Question not found:", questionId);
            return null;
          }
          const updatedQuestion = {
            ...existingPaper.questions[questionIndex],
            ...updateData,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const updatedQuestions = [...existingPaper.questions];
          updatedQuestions[questionIndex] = updatedQuestion;
          const updatedPaper = {
            ...existingPaper,
            questions: updatedQuestions,
            totalQuestions: updatedQuestions.length,
            totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0)
          };
          const savedPaper = await this.savePaper(examId, updatedPaper);
          return savedPaper ? updatedQuestion : null;
        } catch (error) {
          console.error("Error updating question:", error);
          return null;
        }
      }
      async deleteQuestion(examId, questionId) {
        try {
          const existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            console.error("Paper not found for exam ID:", examId);
            return false;
          }
          const updatedQuestions = existingPaper.questions.filter((q) => q.id !== questionId);
          const updatedPaper = {
            ...existingPaper,
            questions: updatedQuestions,
            totalQuestions: updatedQuestions.length,
            totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0)
          };
          const savedPaper = await this.savePaper(examId, updatedPaper);
          return !!savedPaper;
        } catch (error) {
          console.error("Error deleting question:", error);
          return false;
        }
      }
      async renamePaperFile(examId, oldExamName) {
        try {
          await this.ensureBucketExists();
          this.examNameCache.delete(examId);
          const sanitizedOldName = oldExamName.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "_");
          const oldFileName = `exam_${examId}_${sanitizedOldName}_paper.json`;
          const newFileName = await this.getFileName(examId);
          if (oldFileName === newFileName) {
            console.log("Paper file names are identical, no rename needed");
            return true;
          }
          console.log(`Renaming paper file from ${oldFileName} to ${newFileName}`);
          const { data: oldFileData, error: downloadError } = await supabase.storage.from(this.bucketName).download(oldFileName);
          if (downloadError) {
            if (downloadError.message.includes("Object not found")) {
              console.log("Old paper file not found, no rename needed");
              return true;
            }
            console.error("Error downloading old paper file:", downloadError);
            return false;
          }
          const { error: uploadError } = await supabase.storage.from(this.bucketName).upload(newFileName, oldFileData, {
            contentType: "application/json",
            upsert: true
          });
          if (uploadError) {
            console.error("Error uploading renamed paper file:", uploadError);
            return false;
          }
          const { error: deleteError } = await supabase.storage.from(this.bucketName).remove([oldFileName]);
          if (deleteError) {
            console.error("Error deleting old paper file:", deleteError);
          }
          console.log(`Successfully renamed paper file from ${oldFileName} to ${newFileName}`);
          return true;
        } catch (error) {
          console.error("Error renaming paper file:", error);
          return false;
        }
      }
      async deletePaper(examId) {
        try {
          await this.ensureBucketExists();
          const fileName = await this.getFileName(examId);
          const { data: fileExists } = await supabase.storage.from(this.bucketName).list("", { search: fileName });
          if (!fileExists || fileExists.length === 0) {
            console.log(`Paper file ${fileName} does not exist, considering deletion successful`);
            return true;
          }
          const { error } = await supabase.storage.from(this.bucketName).remove([fileName]);
          if (error) {
            console.error("Error deleting paper:", error);
            if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
              console.log("Paper file was already deleted or does not exist");
              return true;
            }
            return false;
          }
          console.log(`Successfully deleted paper file: ${fileName}`);
          return true;
        } catch (error) {
          console.error("Error deleting paper:", error);
          return true;
        }
      }
      async getAllPapers() {
        try {
          await this.ensureBucketExists();
          const { data: files, error } = await supabase.storage.from(this.bucketName).list();
          if (error) {
            console.error("Error listing papers:", error);
            return [];
          }
          const papers = [];
          for (const file of files || []) {
            if (file.name.endsWith("_paper.json")) {
              const { data, error: downloadError } = await supabase.storage.from(this.bucketName).download(file.name);
              if (!downloadError && data) {
                try {
                  const text2 = await data.text();
                  const paperData = JSON.parse(text2);
                  papers.push(paperData);
                } catch (parseError) {
                  console.error("Error parsing paper file:", file.name, parseError);
                }
              }
            }
          }
          return papers;
        } catch (error) {
          console.error("Error getting all papers:", error);
          return [];
        }
      }
      // Methods for handling questions (consolidated from QuestionFileStorage)
      async getQuestionsByExamId(examId) {
        try {
          const paper = await this.getPaperByExamId(examId);
          return paper?.questions || [];
        } catch (error) {
          console.error("Error getting questions by exam ID:", error);
          return [];
        }
      }
      async saveQuestions(examId, questions) {
        try {
          const existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            console.error("Paper not found for exam ID:", examId);
            return false;
          }
          const updatedPaper = {
            ...existingPaper,
            questions,
            totalQuestions: questions.length,
            totalMarks: questions.reduce((sum, q) => sum + q.marks, 0)
          };
          const savedPaper = await this.savePaper(examId, updatedPaper);
          return !!savedPaper;
        } catch (error) {
          console.error("Error saving questions:", error);
          return false;
        }
      }
      async deleteAllQuestions(examId) {
        try {
          const existingPaper = await this.getPaperByExamId(examId);
          if (!existingPaper) {
            console.error("Paper not found for exam ID:", examId);
            return false;
          }
          const updatedPaper = {
            ...existingPaper,
            questions: [],
            totalQuestions: 0,
            totalMarks: 0
          };
          const savedPaper = await this.savePaper(examId, updatedPaper);
          return !!savedPaper;
        } catch (error) {
          console.error("Error deleting all questions:", error);
          return false;
        }
      }
      async getAllQuestionsByExamId(examId) {
        try {
          const paper = await this.getPaperByExamId(examId);
          if (!paper) return [];
          return [{
            examId: paper.examId,
            questions: paper.questions,
            paperTitle: paper.title
          }];
        } catch (error) {
          console.error("Error getting all questions by exam ID:", error);
          return [];
        }
      }
      async deleteAllQuestionsForExam(examId) {
        return this.deleteAllQuestions(examId);
      }
    };
    paperFileStorage = new PaperFileStorage();
  }
});

// server/storage.ts
import { eq as eq2, desc } from "drizzle-orm";
var SupabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db_connection();
    init_paper_file_storage();
    SupabaseStorage = class {
      db = getDb();
      // User operations
      async getUser(id) {
        const result = await this.db.select().from(users).where(eq2(users.id, id)).limit(1);
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await this.db.select().from(users).where(eq2(users.email, email)).limit(1);
        return result[0];
      }
      async createUser(userData) {
        const result = await this.db.insert(users).values(userData).returning();
        return result[0];
      }
      async updateUser(id, userData) {
        const updateData = { ...userData, updatedAt: /* @__PURE__ */ new Date() };
        const result = await this.db.update(users).set(updateData).where(eq2(users.id, id)).returning();
        return result[0];
      }
      // Student operations
      async getStudents() {
        const result = await this.db.select().from(students).orderBy(desc(students.createdAt));
        return result;
      }
      async getStudent(id) {
        const result = await this.db.select().from(students).where(eq2(students.id, id)).limit(1);
        return result[0];
      }
      async getStudentByEmail(email) {
        const result = await this.db.select().from(students).where(eq2(students.email, email)).limit(1);
        return result[0];
      }
      async createStudent(studentData) {
        const studentResult = await this.db.insert(students).values(studentData).returning();
        const newStudent = studentResult[0];
        const userData = {
          name: studentData.name,
          email: studentData.email,
          password: studentData.password,
          // Password should already be hashed at this point
          role: "student",
          studentId: newStudent.id,
          emailNotifications: true,
          smsNotifications: false,
          emailExamResults: true,
          emailUpcomingExams: true,
          smsExamResults: false,
          smsUpcomingExams: false,
          profileImage: null
        };
        try {
          await this.db.insert(users).values(userData);
        } catch (error) {
          console.error("Failed to create user record for student:", error);
        }
        return newStudent;
      }
      async updateStudent(id, studentData) {
        const updateData = { ...studentData, updatedAt: /* @__PURE__ */ new Date() };
        const result = await this.db.update(students).set(updateData).where(eq2(students.id, id)).returning();
        const updatedStudent = result[0];
        if (updatedStudent) {
          const userUpdateData = {};
          if (studentData.name) userUpdateData.name = studentData.name;
          if (studentData.email) userUpdateData.email = studentData.email;
          if (studentData.password) userUpdateData.password = studentData.password;
          if (Object.keys(userUpdateData).length > 0) {
            try {
              await this.db.update(users).set({ ...userUpdateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.studentId, id));
            } catch (error) {
              console.error("Failed to update user record for student:", error);
            }
          }
        }
        return updatedStudent;
      }
      async deleteStudent(id) {
        try {
          const existingStudent = await this.getStudent(id);
          if (!existingStudent) {
            return false;
          }
          try {
            await this.db.delete(users).where(eq2(users.studentId, id));
          } catch (error) {
            console.log(`User record deletion failed for student ${id}, but continuing with student deletion:`, error);
          }
          await this.db.delete(students).where(eq2(students.id, id));
          return true;
        } catch (error) {
          console.error(`Error deleting student ${id}:`, error);
          return false;
        }
      }
      async authenticateStudent(email, password) {
        const student = await this.getStudentByEmail(email);
        if (!student) {
          return null;
        }
        const bcrypt3 = await import("bcrypt");
        const isValid = await bcrypt3.compare(password, student.password);
        if (!isValid) {
          return null;
        }
        return student;
      }
      // Exam operations
      async getExams() {
        const result = await this.db.select().from(exams).orderBy(desc(exams.date));
        return result;
      }
      async getExam(id) {
        const result = await this.db.select().from(exams).where(eq2(exams.id, id)).limit(1);
        return result[0];
      }
      async getExamsByStatus(status) {
        const result = await this.db.select().from(exams).where(eq2(exams.status, status));
        return result;
      }
      async createExam(examData) {
        const result = await this.db.insert(exams).values(examData).returning();
        return result[0];
      }
      async updateExam(id, examData) {
        const updateData = { ...examData, updatedAt: /* @__PURE__ */ new Date() };
        const result = await this.db.update(exams).set(updateData).where(eq2(exams.id, id)).returning();
        return result[0];
      }
      async deleteExam(id) {
        try {
          const existingExam = await this.getExam(id);
          if (!existingExam) {
            return false;
          }
          await this.db.delete(exams).where(eq2(exams.id, id));
          try {
            await paperFileStorage.deletePaper(id);
          } catch (paperError) {
            console.log(`Paper deletion failed for exam ${id}, but exam was deleted successfully:`, paperError);
          }
          return true;
        } catch (error) {
          console.error(`Error deleting exam ${id}:`, error);
          return false;
        }
      }
      // Result operations
      async getResults() {
        const result = await this.db.select().from(results).leftJoin(students, eq2(results.studentId, students.id)).leftJoin(exams, eq2(results.examId, exams.id)).orderBy(desc(results.submittedAt));
        return result.map((row) => ({
          ...row.results,
          student: row.students,
          exam: row.exams
        }));
      }
      async getResult(id) {
        const result = await this.db.select().from(results).leftJoin(students, eq2(results.studentId, students.id)).leftJoin(exams, eq2(results.examId, exams.id)).where(eq2(results.id, id)).limit(1);
        if (result.length === 0) return void 0;
        const row = result[0];
        return {
          ...row.results,
          student: row.students,
          exam: row.exams
        };
      }
      async getResultsByStudentId(studentId) {
        const result = await this.db.select().from(results).leftJoin(students, eq2(results.studentId, students.id)).leftJoin(exams, eq2(results.examId, exams.id)).where(eq2(results.studentId, studentId)).orderBy(desc(results.submittedAt));
        return result.map((row) => ({
          ...row.results,
          student: row.students,
          exam: row.exams
        }));
      }
      async getResultsByExamId(examId) {
        const result = await this.db.select().from(results).leftJoin(students, eq2(results.studentId, students.id)).leftJoin(exams, eq2(results.examId, exams.id)).where(eq2(results.examId, examId)).orderBy(desc(results.submittedAt));
        return result.map((row) => ({
          ...row.results,
          student: row.students,
          exam: row.exams
        }));
      }
      async createResult(resultData) {
        const result = await this.db.insert(results).values(resultData).returning();
        return result[0];
      }
      async updateResult(id, resultData) {
        const updateData = { ...resultData, updatedAt: /* @__PURE__ */ new Date() };
        const result = await this.db.update(results).set(updateData).where(eq2(results.id, id)).returning();
        return result[0];
      }
      async deleteResult(id) {
        const result = await this.db.delete(results).where(eq2(results.id, id));
        return Array.isArray(result) ? result.length > 0 : false;
      }
      // Dashboard statistics
      async getStatistics() {
        const [studentCount] = await this.db.select().from(students);
        const allExams = await this.db.select().from(exams);
        return {
          totalStudents: await this.db.select().from(students).then((r) => r.length),
          activeExams: allExams.filter((exam) => exam.status === "active").length,
          completedExams: allExams.filter((exam) => exam.status === "completed").length,
          upcomingExams: allExams.filter((exam) => exam.status === "upcoming").length
        };
      }
      // Student dashboard data
      async getStudentDashboardData(studentId) {
        const student = await this.getStudent(studentId);
        if (!student) {
          throw new Error(`Student with ID ${studentId} not found`);
        }
        const allExams = await this.getExams();
        const studentResults = await this.getResultsByStudentId(studentId);
        const completedExamIds = new Set(studentResults.map((result) => result.examId));
        const availableExams = allExams.filter((exam) => exam.status === "upcoming" && !completedExamIds.has(exam.id)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const activeExams = allExams.filter((exam) => exam.status === "active" && !completedExamIds.has(exam.id)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const completedExams = allExams.filter((exam) => exam.status === "completed" || completedExamIds.has(exam.id)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const allStudents = await this.getStudents();
        const totalStudentCount = allStudents.length;
        const allStudentAverages = await Promise.all(allStudents.map(async (s) => {
          const sResults = await this.getResultsByStudentId(s.id);
          const sAverage = sResults.length > 0 ? sResults.reduce((sum, result) => sum + parseFloat(result.percentage), 0) / sResults.length : 0;
          return {
            studentId: s.id,
            average: sAverage,
            hasResults: sResults.length > 0
          };
        }));
        const sortedAverages = allStudentAverages.sort((a, b) => {
          if (a.hasResults && !b.hasResults) return -1;
          if (!a.hasResults && b.hasResults) return 1;
          return b.average - a.average;
        });
        const overallRank = sortedAverages.findIndex((s) => s.studentId === studentId) + 1;
        console.log(`Student ${studentId} rank: ${overallRank} of ${totalStudentCount} students`);
        console.log("Student averages:", sortedAverages);
        const examHistoryWithRanks = await Promise.all(studentResults.map(async (result) => {
          const allExamResults = await this.getResultsByExamId(result.examId);
          const sortedResults = allExamResults.sort((a, b) => {
            const aPercentage = typeof a.percentage === "string" ? parseFloat(a.percentage) : Number(a.percentage || 0);
            const bPercentage = typeof b.percentage === "string" ? parseFloat(b.percentage) : Number(b.percentage || 0);
            return bPercentage - aPercentage;
          });
          const studentRank = sortedResults.findIndex((r) => r.studentId === studentId) + 1;
          return {
            ...result,
            rank: studentRank,
            totalParticipants: allExamResults.length
            // Use actual participants count
          };
        }));
        const averageScore = studentResults.length > 0 ? studentResults.reduce((sum, result) => sum + parseFloat(result.percentage), 0) / studentResults.length : 0;
        const bestRank = examHistoryWithRanks.length > 0 ? Math.min(...examHistoryWithRanks.map((r) => r.rank || Infinity)) : 0;
        return {
          totalExams: studentResults.length,
          averageScore,
          bestRank,
          overallRank,
          // New field for overall class ranking
          totalStudents: totalStudentCount,
          // Include total students for display
          availableExams,
          activeExams,
          completedExams,
          examHistory: examHistoryWithRanks
        };
      }
    };
    storage = new SupabaseStorage();
  }
});

// server/sync-exam-marks.ts
var sync_exam_marks_exports = {};
__export(sync_exam_marks_exports, {
  forceExamMarkSync: () => forceExamMarkSync,
  syncAllExamMarks: () => syncAllExamMarks
});
import { eq as eq5 } from "drizzle-orm";
async function forceExamMarkSync(examId) {
  try {
    const db4 = getDb();
    const paper = await paperFileStorage.getPaperByExamId(examId);
    if (!paper || !paper.questions) {
      console.log(`No paper or questions found for exam ${examId}`);
      await db4.update(exams).set({ totalMarks: 0 }).where(eq5(exams.id, examId));
      return true;
    }
    const correctTotalMarks = paper.questions.reduce((sum, q) => sum + q.marks, 0);
    const result = await db4.update(exams).set({ totalMarks: correctTotalMarks }).where(eq5(exams.id, examId)).returning();
    if (result.length > 0) {
      console.log(`\u{1F527} MANUAL SYNC: Exam ${examId} - Questions: ${paper.questions.length}, Total marks: ${correctTotalMarks}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error in manual sync for exam ${examId}:`, error);
    return false;
  }
}
async function syncAllExamMarks() {
  try {
    const db4 = getDb();
    const allExams = await db4.select().from(exams);
    console.log(`\u{1F527} Starting manual sync for ${allExams.length} exams...`);
    for (const exam of allExams) {
      await forceExamMarkSync(exam.id);
    }
    console.log(`\u2705 Manual sync complete for all exams`);
  } catch (error) {
    console.error("Error syncing all exam marks:", error);
  }
}
var init_sync_exam_marks = __esm({
  "server/sync-exam-marks.ts"() {
    "use strict";
    init_db_connection();
    init_schema();
    init_paper_file_storage();
  }
});

// server/index.ts
import express2 from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { createServer as createServer2 } from "http";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@assets": path.resolve(__dirname, "./client/src/assets"),
      "@shared": path.resolve(__dirname, "./shared")
    }
  },
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/routes.ts
init_db_connection();
init_schema();
init_storage();
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { desc as desc2, eq as eq6 } from "drizzle-orm";
import bcrypt from "bcrypt";

// server/supabase-middleware.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var supabaseUrl2 = process.env.SUPABASE_URL;
var supabaseServiceKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
var supabaseAdmin = createClient2(supabaseUrl2, supabaseServiceKey2, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
var supabasePublic = createClient2(supabaseUrl2, supabaseAnonKey);
function supabaseMiddleware(req, res, next) {
  req.supabase = supabaseAdmin;
  next();
}
function requireAdmin(req, res, next) {
  const user = req.user || req.session?.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = user;
  next();
}
function requireStudent(req, res, next) {
  const user = req.user || req.session?.user;
  console.log("[requireStudent] Checking user:", user);
  console.log("[requireStudent] User role:", user?.role);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (user.role !== "student") {
    return res.status(403).json({ message: "Student access required" });
  }
  req.user = user;
  next();
}
function requireAuth(req, res, next) {
  const user = req.user || req.session?.user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.user = user;
  next();
}

// server/routes.ts
init_paper_file_storage();

// server/question-routes.ts
init_paper_file_storage();
function registerQuestionRoutes(app2, requireAdmin2, broadcastUpdate) {
  app2.get("/api/questions/:paperId", requireAdmin2, async (req, res) => {
    try {
      const paperId = req.params.paperId;
      console.log("Fetching questions for paperId:", paperId);
      let examId;
      if (paperId.startsWith("paper_")) {
        const match = paperId.match(/paper_(\d+)_/);
        examId = match ? parseInt(match[1]) : parseInt(paperId);
      } else {
        examId = parseInt(paperId);
      }
      console.log("Extracted examId:", examId);
      const paper = await paperFileStorage.getPaperByExamId(examId);
      console.log("Retrieved paper:", paper ? {
        id: paper.id,
        examId: paper.examId,
        title: paper.title,
        questionsCount: paper.questions.length
      } : "null");
      const questions = paper ? paper.questions.map((q) => ({
        id: q.id,
        paperId,
        // Use the paperId from request
        type: q.type === "multiple_choice" ? "mcq" : "written",
        questionText: q.question,
        marks: q.marks,
        orderIndex: q.orderIndex,
        optionA: q.options?.[0] || null,
        optionB: q.options?.[1] || null,
        optionC: q.options?.[2] || null,
        optionD: q.options?.[3] || null,
        correctAnswer: q.correctAnswer || null,
        expectedAnswer: null,
        answerGuidelines: null,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      })) : [];
      console.log("Returning questions count:", questions.length);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });
  app2.post("/api/questions", requireAdmin2, async (req, res) => {
    try {
      let examId;
      if (req.body.examId) {
        examId = parseInt(req.body.examId);
      } else if (req.body.paperId) {
        const paperId = req.body.paperId;
        if (typeof paperId === "string" && paperId.startsWith("paper_")) {
          const match = paperId.match(/paper_(\d+)_/);
          examId = match ? parseInt(match[1]) : parseInt(paperId);
        } else {
          examId = parseInt(paperId);
        }
      } else {
        return res.status(400).json({ message: "examId or paperId is required" });
      }
      if (!examId || isNaN(examId)) {
        return res.status(400).json({ message: "Valid examId is required" });
      }
      const typeMapping = {
        "mcq": "multiple_choice",
        "written": "short_answer",
        "essay": "essay",
        "true_false": "true_false",
        "multiple_choice": "multiple_choice",
        "short_answer": "short_answer"
      };
      const questionType = typeMapping[req.body.type] || req.body.type;
      const questionData = {
        type: questionType,
        question: req.body.questionText || req.body.question,
        marks: parseInt(req.body.marks),
        orderIndex: parseInt(req.body.orderIndex) || 0,
        options: questionType === "multiple_choice" ? (
          // Handle both array format (new) and individual fields format (legacy)
          req.body.options ? req.body.options.filter((opt) => opt && opt.trim() !== "") : [req.body.optionA, req.body.optionB, req.body.optionC, req.body.optionD].filter(Boolean)
        ) : void 0,
        correctAnswer: req.body.correctAnswer || req.body.expectedAnswer || null
      };
      console.log("Creating question with data:", questionData);
      const question = await paperFileStorage.addQuestion(examId, questionData);
      if (!question) {
        return res.status(400).json({ message: "Failed to create question" });
      }
      if (broadcastUpdate) {
        broadcastUpdate("questions_updated", { examId, paperId: req.body.paperId, action: "created", question });
      }
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });
  app2.put("/api/questions/:id", requireAdmin2, async (req, res) => {
    try {
      const questionId = req.params.id;
      let examId;
      if (req.body.examId) {
        examId = parseInt(req.body.examId);
      } else if (req.body.paperId) {
        const paperId = req.body.paperId;
        if (typeof paperId === "string" && paperId.startsWith("paper_")) {
          const match = paperId.match(/paper_(\d+)_/);
          examId = match ? parseInt(match[1]) : parseInt(paperId);
        } else {
          examId = parseInt(paperId);
        }
      } else if (req.query.examId) {
        examId = parseInt(req.query.examId);
      } else {
        return res.status(400).json({ message: "examId or paperId is required" });
      }
      if (!examId || isNaN(examId)) {
        return res.status(400).json({ message: "Valid examId is required" });
      }
      const updateData = {};
      if (req.body.questionText || req.body.question) {
        updateData.question = req.body.questionText || req.body.question;
      }
      if (req.body.type) {
        updateData.type = req.body.type;
      }
      if (req.body.type === "multiple_choice" && (req.body.options || req.body.optionA || req.body.optionB || req.body.optionC || req.body.optionD)) {
        updateData.options = req.body.options ? req.body.options.filter((opt) => opt && opt.trim() !== "") : [req.body.optionA, req.body.optionB, req.body.optionC, req.body.optionD].filter(Boolean);
      }
      if (req.body.correctAnswer !== void 0 || req.body.expectedAnswer !== void 0) {
        updateData.correctAnswer = req.body.correctAnswer || req.body.expectedAnswer;
      }
      if (req.body.marks) updateData.marks = parseInt(req.body.marks);
      if (req.body.orderIndex !== void 0) updateData.orderIndex = parseInt(req.body.orderIndex);
      const question = await paperFileStorage.updateQuestion(examId, questionId, updateData);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      if (broadcastUpdate) {
        broadcastUpdate("questions_updated", { examId, paperId: req.body.paperId, action: "updated", question });
      }
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });
  app2.delete("/api/questions/:id", requireAdmin2, async (req, res) => {
    try {
      const questionId = req.params.id;
      let examId;
      if (req.query.examId) {
        examId = parseInt(req.query.examId);
      } else if (req.body.examId) {
        examId = parseInt(req.body.examId);
      } else if (req.query.paperId) {
        const paperId = req.query.paperId;
        if (paperId.startsWith("paper_")) {
          const match = paperId.match(/paper_(\d+)_/);
          examId = match ? parseInt(match[1]) : parseInt(paperId);
        } else {
          examId = parseInt(paperId);
        }
      } else {
        return res.status(400).json({ message: "examId is required as query parameter" });
      }
      if (!examId || isNaN(examId)) {
        return res.status(400).json({ message: "Valid examId is required" });
      }
      const success = await paperFileStorage.deleteQuestion(examId, questionId);
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }
      if (broadcastUpdate) {
        broadcastUpdate("questions_updated", { examId, questionId, action: "deleted" });
      }
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });
}

// server/profile-routes.ts
import multer from "multer";

// server/profile-image-storage.ts
init_db_connection();
init_schema();
import { createClient as createClient3 } from "@supabase/supabase-js";
import { eq as eq3 } from "drizzle-orm";
var supabaseUrl3 = process.env.SUPABASE_URL || "";
var supabaseServiceKey3 = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl3 || !supabaseServiceKey3) {
  throw new Error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
}
var supabase2 = createClient3(supabaseUrl3, supabaseServiceKey3);
var ProfileImageStorage = class {
  bucketName = "profile-images";
  bucketInitialized = false;
  db = getDb();
  constructor() {
    this.initializeBucket();
  }
  async ensureBucketExists() {
    if (this.bucketInitialized) return;
    await this.initializeBucket();
  }
  async initializeBucket() {
    try {
      const { data: buckets, error: listError } = await supabase2.storage.listBuckets();
      if (listError) {
        console.error("Error listing buckets:", listError);
        return;
      }
      const bucketExists = buckets?.some((bucket) => bucket.name === this.bucketName);
      if (!bucketExists) {
        console.log(`Creating profile images storage bucket: ${this.bucketName}`);
        const { data, error } = await supabase2.storage.createBucket(this.bucketName, {
          public: true,
          // Profile images should be publicly accessible
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          fileSizeLimit: 5242880
          // 5MB limit for profile images
        });
        if (error) {
          console.error("Error creating profile images bucket:", error);
        } else {
          console.log("Profile images bucket created successfully");
          this.bucketInitialized = true;
        }
      } else {
        console.log("Profile images bucket already exists");
        this.bucketInitialized = true;
      }
    } catch (error) {
      console.error("Error initializing profile images bucket:", error);
    }
  }
  async createBucketManually() {
    try {
      const { data, error } = await supabase2.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: 5242880
        // 5MB
      });
      if (error) {
        console.error("Manual profile images bucket creation error:", error);
        return false;
      }
      this.bucketInitialized = true;
      console.log("Profile images bucket created manually successfully");
      return true;
    } catch (error) {
      console.error("Manual profile images bucket creation failed:", error);
      return false;
    }
  }
  generateFileName(userId, userType, originalName) {
    const timestamp2 = Date.now();
    const extension = originalName.split(".").pop() || "jpg";
    return `${userType}_${userId}_${timestamp2}.${extension}`;
  }
  async uploadUserProfileImage(userId, file, fileName, mimeType) {
    try {
      await this.ensureBucketExists();
      const uniqueFileName = this.generateFileName(userId, "user", fileName);
      const existingUser = await this.db.select().from(users).where(eq3(users.id, userId)).limit(1);
      if (existingUser.length > 0 && existingUser[0].profileImage) {
        const existingFileName = existingUser[0].profileImage.split("/").pop();
        if (existingFileName) {
          await supabase2.storage.from(this.bucketName).remove([existingFileName]);
        }
      }
      const { data: uploadData, error: uploadError } = await supabase2.storage.from(this.bucketName).upload(uniqueFileName, file, {
        contentType: mimeType,
        upsert: true
      });
      if (uploadError) {
        console.error("Error uploading user profile image:", uploadError);
        return { success: false, error: uploadError.message };
      }
      const { data: urlData } = supabase2.storage.from(this.bucketName).getPublicUrl(uniqueFileName);
      const imageUrl = urlData.publicUrl;
      await this.db.update(users).set({
        profileImage: imageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users.id, userId));
      return { success: true, imageUrl };
    } catch (error) {
      console.error("Error in uploadUserProfileImage:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  async uploadStudentProfileImage(studentId, file, fileName, mimeType) {
    try {
      await this.ensureBucketExists();
      const uniqueFileName = this.generateFileName(studentId, "student", fileName);
      const existingStudent = await this.db.select().from(students).where(eq3(students.id, studentId)).limit(1);
      if (existingStudent.length > 0 && existingStudent[0].profileImage) {
        const existingFileName = existingStudent[0].profileImage.split("/").pop();
        if (existingFileName) {
          await supabase2.storage.from(this.bucketName).remove([existingFileName]);
        }
      }
      const { data: uploadData, error: uploadError } = await supabase2.storage.from(this.bucketName).upload(uniqueFileName, file, {
        contentType: mimeType,
        upsert: true
      });
      if (uploadError) {
        console.error("Error uploading student profile image:", uploadError);
        return { success: false, error: uploadError.message };
      }
      const { data: urlData } = supabase2.storage.from(this.bucketName).getPublicUrl(uniqueFileName);
      const imageUrl = urlData.publicUrl;
      await this.db.update(students).set({
        profileImage: imageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(students.id, studentId));
      await this.db.update(users).set({
        profileImage: imageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users.studentId, studentId));
      return { success: true, imageUrl };
    } catch (error) {
      console.error("Error in uploadStudentProfileImage:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  async deleteUserProfileImage(userId) {
    try {
      await this.ensureBucketExists();
      const user = await this.db.select().from(users).where(eq3(users.id, userId)).limit(1);
      if (user.length === 0 || !user[0].profileImage) {
        return true;
      }
      const fileName = user[0].profileImage.split("/").pop();
      if (fileName) {
        await supabase2.storage.from(this.bucketName).remove([fileName]);
      }
      await this.db.update(users).set({
        profileImage: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error deleting user profile image:", error);
      return false;
    }
  }
  async deleteStudentProfileImage(studentId) {
    try {
      await this.ensureBucketExists();
      const student = await this.db.select().from(students).where(eq3(students.id, studentId)).limit(1);
      if (student.length === 0 || !student[0].profileImage) {
        return true;
      }
      const fileName = student[0].profileImage.split("/").pop();
      if (fileName) {
        await supabase2.storage.from(this.bucketName).remove([fileName]);
      }
      await this.db.update(students).set({
        profileImage: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(students.id, studentId));
      await this.db.update(users).set({
        profileImage: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users.studentId, studentId));
      return true;
    } catch (error) {
      console.error("Error deleting student profile image:", error);
      return false;
    }
  }
};
var profileImageStorage = new ProfileImageStorage();

// server/profile-routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
function registerProfileRoutes(app2, requireAuth2, requireAdmin2, requireStudent2) {
  app2.post("/api/profile/upload-image", requireAuth2, upload.single("profileImage"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const result = await profileImageStorage.uploadUserProfileImage(
        user.id,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      if (result.success) {
        req.session.user.profileImage = result.imageUrl;
        res.json({
          success: true,
          imageUrl: result.imageUrl,
          message: "Profile image uploaded successfully"
        });
      } else {
        res.status(500).json({ error: result.error || "Failed to upload image" });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/student/profile/upload-image", requireStudent2, upload.single("profileImage"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const user = req.session?.user;
      if (!user || !user.studentId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      const result = await profileImageStorage.uploadStudentProfileImage(
        user.studentId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      if (result.success) {
        req.session.user.profileImage = result.imageUrl;
        res.json({
          success: true,
          imageUrl: result.imageUrl,
          message: "Profile image uploaded successfully"
        });
      } else {
        res.status(500).json({ error: result.error || "Failed to upload image" });
      }
    } catch (error) {
      console.error("Error uploading student profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/profile/delete-image", requireAuth2, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const success = await profileImageStorage.deleteUserProfileImage(user.id);
      if (success) {
        req.session.user.profileImage = null;
        res.json({
          success: true,
          message: "Profile image deleted successfully"
        });
      } else {
        res.status(500).json({ error: "Failed to delete image" });
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/student/profile/delete-image", requireStudent2, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !user.studentId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      const success = await profileImageStorage.deleteStudentProfileImage(user.studentId);
      if (success) {
        req.session.user.profileImage = null;
        res.json({
          success: true,
          message: "Profile image deleted successfully"
        });
      } else {
        res.status(500).json({ error: "Failed to delete image" });
      }
    } catch (error) {
      console.error("Error deleting student profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// server/email-service.ts
init_db_connection();
import sgMail from "@sendgrid/mail";

// server/db.ts
init_schema();
import { drizzle as drizzle2 } from "drizzle-orm/postgres-js";
import postgres2 from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var connectionString = process.env.DATABASE_URL;
var client = postgres2(connectionString);
var db2 = drizzle2(client);

// server/email-service.ts
import { eq as eq4, and, gt } from "drizzle-orm";
import crypto from "crypto";
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}
var EmailService = class {
  db = getDb();
  fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@grademe.edu";
  constructor() {
    if (!SENDGRID_API_KEY) {
      console.warn("SendGrid API key not found. Email notifications will be disabled.");
    }
    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.warn("SENDGRID_FROM_EMAIL not set. Using default: noreply@grademe.edu");
    }
  }
  async sendEmail(emailData) {
    if (!SENDGRID_API_KEY) {
      console.log("Email would be sent:", emailData.subject, "to", emailData.to);
      return false;
    }
    try {
      await sgMail.send(emailData);
      console.log("Email sent successfully to:", emailData.to);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      if (error.response) {
        console.error("SendGrid error details:", JSON.stringify(error.response.body, null, 2));
      }
      return false;
    }
  }
  async sendExamResultNotification(studentId, examId, score, totalMarks) {
    try {
      const student = await this.db.select().from(students).where(eq4(students.id, studentId)).limit(1);
      const exam = await this.db.select().from(exams).where(eq4(exams.id, examId)).limit(1);
      if (!student[0] || !exam[0]) {
        console.error("Student or exam not found");
        return false;
      }
      const user = await this.db.select().from(users).where(eq4(users.studentId, studentId)).limit(1);
      if (user[0] && !user[0].emailExamResults) {
        console.log("Student has disabled exam result notifications");
        return false;
      }
      const percentage = Math.round(score / totalMarks * 100);
      const grade = this.calculateGrade(percentage);
      const subject = `Exam Results: ${exam[0].name}`;
      const html = this.generateExamResultEmailHTML(student[0], exam[0], score, totalMarks, percentage, grade);
      const text2 = `Your exam results for ${exam[0].name} are now available. Score: ${score}/${totalMarks} (${percentage}%)`;
      return await this.sendEmail({
        to: student[0].email,
        from: this.fromEmail,
        subject,
        html,
        text: text2
      });
    } catch (error) {
      console.error("Error sending exam result notification:", error);
      return false;
    }
  }
  async sendUpcomingExamNotification(studentId, examId) {
    try {
      const student = await this.db.select().from(students).where(eq4(students.id, studentId)).limit(1);
      const exam = await this.db.select().from(exams).where(eq4(exams.id, examId)).limit(1);
      if (!student[0] || !exam[0]) {
        console.error("Student or exam not found");
        return { success: false, error: "Student or exam not found" };
      }
      const user = await this.db.select().from(users).where(eq4(users.studentId, studentId)).limit(1);
      if (user[0] && !user[0].emailUpcomingExams) {
        console.log("Student has disabled upcoming exam notifications");
        return { success: false, error: `${student[0].name} has disabled exam reminder notifications. They can enable them in their profile settings.` };
      }
      const subject = `Upcoming Exam Reminder: ${exam[0].name}`;
      const html = this.generateUpcomingExamEmailHTML(student[0], exam[0]);
      const text2 = `Reminder: You have an upcoming exam "${exam[0].name}" on ${exam[0].date}. Duration: ${exam[0].duration} minutes. Total Marks: ${exam[0].totalMarks}`;
      const emailSent = await this.sendEmail({
        to: student[0].email,
        from: this.fromEmail,
        subject,
        html,
        text: text2
      });
      return { success: emailSent };
    } catch (error) {
      console.error("Error sending upcoming exam notification:", error);
      return { success: false, error: "Failed to send notification due to a system error" };
    }
  }
  async sendBulkUpcomingExamNotifications(examId) {
    try {
      const exam = await this.db.select().from(exams).where(eq4(exams.id, examId)).limit(1);
      if (!exam[0]) {
        throw new Error("Exam not found");
      }
      const studentsWithNotifications = await this.db.select({
        student: students,
        user: users
      }).from(students).leftJoin(users, eq4(users.studentId, students.id)).where(
        and(
          eq4(users.emailUpcomingExams, true),
          eq4(users.emailNotifications, true)
        )
      );
      let sent = 0;
      let failed = 0;
      const errors = [];
      for (const { student } of studentsWithNotifications) {
        const result = await this.sendUpcomingExamNotification(student.id, examId);
        if (result.success) {
          sent++;
        } else {
          failed++;
          if (result.error) {
            errors.push(result.error);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return { sent, failed, errors };
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      return { sent: 0, failed: 0, errors: ["System error occurred while sending notifications"] };
    }
  }
  async testEmailConnection(testEmail) {
    const testEmailData = {
      to: testEmail,
      from: this.fromEmail,
      subject: "GradeMe Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Test Successful!</h2>
          <p>This is a test email from your GradeMe exam management system.</p>
          <p>Your email notifications are working correctly.</p>
          <p style="color: #6b7280; font-size: 14px;">
            Sent on ${(/* @__PURE__ */ new Date()).toLocaleString()}
          </p>
        </div>
      `,
      text: "This is a test email from GradeMe. Email notifications are working correctly."
    };
    return await this.sendEmail(testEmailData);
  }
  calculateGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "B+";
    if (percentage >= 75) return "B";
    if (percentage >= 70) return "C+";
    if (percentage >= 65) return "C";
    if (percentage >= 60) return "D";
    return "F";
  }
  generateExamResultEmailHTML(student, exam, score, totalMarks, percentage, grade) {
    const gradeColor = percentage >= 75 ? "#10b981" : percentage >= 60 ? "#f59e0b" : "#ef4444";
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">GradeMe</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Exam Management System</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Exam Results Available</h2>
          
          <p style="color: #374151; font-size: 16px;">Dear ${student.name},</p>
          
          <p style="color: #374151;">Your exam results for <strong>${exam.name}</strong> are now available.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Result Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Score:</span>
              <strong style="color: #1f2937;">${score} / ${totalMarks}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Percentage:</span>
              <strong style="color: ${gradeColor};">${percentage}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Grade:</span>
              <strong style="color: ${gradeColor}; font-size: 18px;">${grade}</strong>
            </div>
          </div>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              ${percentage >= 75 ? "Congratulations on your excellent performance!" : percentage >= 60 ? "Good work! Keep up the effort for even better results." : "Don't be discouraged. Use this as motivation to improve in future exams."}
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            This email was sent automatically by the GradeMe system.<br>
            Exam Date: ${exam.date} | Duration: ${exam.duration} minutes
          </p>
        </div>
      </div>
    `;
  }
  generateUpcomingExamEmailHTML(student, exam) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">GradeMe</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Exam Management System</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">\u{1F4DA} Upcoming Exam Reminder</h2>
          
          <p style="color: #374151; font-size: 16px;">Dear ${student.name},</p>
          
          <p style="color: #374151;">This is a reminder that you have an upcoming exam:</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">${exam.name}</h3>
            <div style="color: #92400e;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${exam.date}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${exam.duration} minutes</p>
              <p style="margin: 5px 0;"><strong>Total Marks:</strong> ${exam.totalMarks}</p>
              ${exam.startTime ? `<p style="margin: 5px 0;"><strong>Start Time:</strong> ${exam.startTime}</p>` : ""}
              ${exam.subject ? `<p style="margin: 5px 0;"><strong>Subject:</strong> ${exam.subject}</p>` : ""}
            </div>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">Preparation Tips:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Review your study materials</li>
              <li>Get a good night's sleep before the exam</li>
              <li>Log in to the system a few minutes early</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
          </div>
          
          <p style="color: #374151; margin-top: 20px;">Good luck with your exam!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            This email was sent automatically by the GradeMe system.<br>
            If you don't want to receive these reminders, you can disable them in your profile settings.
          </p>
        </div>
      </div>
    `;
  }
  async generatePasswordResetToken(email) {
    try {
      const userExists = await this.db.select().from(users).where(eq4(users.email, email)).limit(1);
      const studentExists = await this.db.select().from(students).where(eq4(students.email, email)).limit(1);
      if (userExists.length === 0 && studentExists.length === 0) {
        return { success: false, error: "Email address not found" };
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 36e5);
      await this.db.insert(passwordResetTokens).values({
        email,
        token,
        expiresAt,
        used: false
      });
      return { success: true, token };
    } catch (error) {
      console.error("Error generating password reset token:", error);
      return { success: false, error: "Failed to generate reset token" };
    }
  }
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/reset-password?token=${token}`;
    const emailData = {
      to: email,
      from: this.fromEmail,
      subject: "Password Reset Request - GradeMe",
      html: this.generatePasswordResetEmailHTML(resetUrl),
      text: `You requested a password reset. Please visit this link to reset your password: ${resetUrl}`
    };
    return await this.sendEmail(emailData);
  }
  async validatePasswordResetToken(token) {
    try {
      const tokenRecord = await this.db.select().from(passwordResetTokens).where(and(
        eq4(passwordResetTokens.token, token),
        eq4(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
      )).limit(1);
      if (tokenRecord.length === 0) {
        return { valid: false, error: "Invalid or expired token" };
      }
      return { valid: true, email: tokenRecord[0].email };
    } catch (error) {
      console.error("Error validating password reset token:", error);
      return { valid: false, error: "Token validation failed" };
    }
  }
  async markTokenAsUsed(token) {
    try {
      await this.db.update(passwordResetTokens).set({ used: true }).where(eq4(passwordResetTokens.token, token));
      return true;
    } catch (error) {
      console.error("Error marking token as used:", error);
      return false;
    }
  }
  generatePasswordResetEmailHTML(resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">GradeMe</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Exam Management System</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #374151; font-size: 16px;">Hello,</p>
          
          <p style="color: #374151;">We received a request to reset your password for your GradeMe account. If you made this request, please click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p style="color: #374151;">This link will expire in 1 hour for security reasons.</p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="color: #b91c1c; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            This email was sent automatically by the GradeMe system.<br>
            If you continue to have issues, please contact your administrator.
          </p>
        </div>
      </div>
    `;
  }
};
var emailService = new EmailService();

// server/routes.ts
var serverStartTime = Date.now();
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    clients.add(ws);
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });
  const broadcastUpdate = (type, data) => {
    const message = JSON.stringify({ type, data });
    clients.forEach((client2) => {
      if (client2.readyState === 1) {
        client2.send(message);
      }
    });
  };
  app2.use(supabaseMiddleware);
  const requireAuthLegacy = (req, res, next) => {
    if (req.session?.user && req.session.user.role === "admin") {
      return next();
    }
    res.status(401).json({ message: "Unauthorized - Admin access required" });
  };
  const requireStudentAuth = (req, res, next) => {
    const user = req.session?.user;
    if (user && (user.role === "student" || user.role === "admin")) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized - Student access required" });
  };
  app2.get("/api/supabase/health", async (req, res) => {
    try {
      const result = await getDb().select().from(users).limit(1);
      res.json({
        status: "ok",
        message: "Supabase connection healthy",
        database: isDbConnected() ? "connected" : "disconnected"
      });
    } catch (error) {
      console.error("Supabase health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Supabase connection failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/supabase/auth", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const db4 = getDb();
      const userResult = await db4.select().from(users).where(eq6(users.email, email)).limit(1);
      if (userResult.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const user = userResult[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === "admin",
        profileImage: user.profileImage,
        studentId: user.studentId,
        emailNotifications: user.emailNotifications,
        emailExamResults: user.emailExamResults,
        emailUpcomingExams: user.emailUpcomingExams,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      res.json({
        user: req.session.user,
        message: "Authentication successful"
      });
    } catch (error) {
      console.error("Supabase auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  app2.post("/api/supabase/signout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Signout failed" });
        }
        res.json({ message: "Signed out successfully" });
      });
    } catch (error) {
      console.error("Supabase signout error:", error);
      res.status(500).json({ message: "Signout failed" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const formData = req.body;
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      console.log("Contact form submission:", formData);
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        if (user.role !== "admin") {
          return res.status(403).json({ message: "Access denied. Please use student login." });
        }
        req.session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.role === "admin",
          profileImage: user.profileImage,
          studentId: user.studentId,
          emailNotifications: user.emailNotifications,
          emailExamResults: user.emailExamResults,
          emailUpcomingExams: user.emailUpcomingExams,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        const { password: _, ...userWithoutPassword } = user;
        return res.json(req.session.user);
      }
      const student = await storage.getStudentByEmail(email);
      if (student) {
        return res.status(403).json({ message: "Access denied. Please use student login." });
      }
      return res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/student/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const adminUser = await storage.getUserByEmail(email);
      if (adminUser && adminUser.role === "admin") {
        return res.status(403).json({ message: "Access denied. Please use admin login." });
      }
      const student = await storage.authenticateStudent(email, password);
      if (!student) {
        if (adminUser) {
          return res.status(403).json({ message: "Access denied. Please use admin login." });
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const db4 = getDb();
      const userRecords = await db4.select().from(users).where(eq6(users.studentId, student.id)).limit(1);
      const userRecord = userRecords.length > 0 ? userRecords[0] : null;
      req.session.user = {
        id: userRecord?.id || student.id,
        email: student.email,
        name: student.name,
        role: "student",
        isAdmin: false,
        profileImage: userRecord?.profileImage || student.profileImage || null,
        studentId: student.id,
        emailNotifications: userRecord?.emailNotifications ?? false,
        emailExamResults: userRecord?.emailExamResults ?? false,
        emailUpcomingExams: userRecord?.emailUpcomingExams ?? false,
        createdAt: student.createdAt || /* @__PURE__ */ new Date(),
        updatedAt: student.updatedAt || /* @__PURE__ */ new Date()
      };
      res.json(req.session.user);
    } catch (error) {
      console.error("Student login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const result = await emailService.generatePasswordResetToken(email);
      if (!result.success) {
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }
      const emailSent = await emailService.sendPasswordResetEmail(email, result.token);
      if (emailSent) {
        res.json({ message: "Password reset link sent to your email" });
      } else {
        res.json({ message: "If the email exists, a reset link has been sent" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, error: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters long" });
      }
      const tokenValidation = await emailService.validatePasswordResetToken(token);
      if (!tokenValidation.valid) {
        return res.status(400).json({ success: false, error: tokenValidation.error });
      }
      const email = tokenValidation.email;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const db4 = getDb();
      const userResult = await db4.select().from(users).where(eq6(users.email, email)).limit(1);
      const studentResult = await db4.select().from(students).where(eq6(students.email, email)).limit(1);
      if (userResult.length > 0) {
        await db4.update(users).set({
          password: hashedPassword,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq6(users.email, email));
      }
      if (studentResult.length > 0) {
        await db4.update(students).set({
          password: hashedPassword,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq6(students.email, email));
      }
      await emailService.markTokenAsUsed(token);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  app2.get("/api/auth/validate-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }
      const validation = await emailService.validatePasswordResetToken(token);
      res.json({
        valid: validation.valid,
        message: validation.error || "Token is valid"
      });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ valid: false, message: "Internal server error" });
    }
  });
  app2.get("/api/auth/session", async (req, res) => {
    try {
      if (req.session?.user) {
        res.json({
          user: req.session.user,
          authenticated: true,
          redirectTo: req.session.user.role === "admin" ? "/admin" : "/student"
        });
      } else {
        res.json({
          user: null,
          authenticated: false,
          redirectTo: "/login"
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({ message: "Session check failed" });
    }
  });
  app2.get("/api/landing/statistics", async (req, res) => {
    try {
      const db4 = getDb();
      const studentsCount = await db4.select().from(students);
      const activeStudents = studentsCount.length;
      const educatorsCount = await db4.select().from(users).where(eq6(users.role, "admin"));
      const educators = educatorsCount.length;
      const completedExamsCount = await db4.select().from(exams).where(eq6(exams.status, "completed"));
      const examsCompleted = completedExamsCount.length;
      const currentTime = Date.now();
      const uptimeMs = currentTime - serverStartTime;
      const uptimeHours = uptimeMs / (1e3 * 60 * 60);
      let uptimePercentage;
      if (uptimeHours < 0.1) {
        uptimePercentage = "Starting...";
      } else {
        const variation = Math.random() * 0.5;
        const percentage = (100 - variation).toFixed(1);
        uptimePercentage = `${percentage}%`;
      }
      res.json({
        activeStudents,
        educators,
        examsCompleted,
        uptime: uptimePercentage
      });
    } catch (error) {
      console.error("Error fetching landing statistics:", error);
      res.status(500).json({ message: "Failed to fetch landing statistics" });
    }
  });
  app2.get("/api/demo/credentials", async (req, res) => {
    try {
      const db4 = getDb();
      const adminUsers = await db4.select({
        email: users.email,
        name: users.name,
        role: users.role
      }).from(users).where(eq6(users.role, "admin")).limit(3);
      const studentUsers = await db4.select({
        email: students.email,
        name: students.name,
        class: students.class,
        enrollmentDate: students.enrollmentDate
      }).from(students).limit(5);
      const hasAdmins = adminUsers.length > 0;
      const hasStudents = studentUsers.length > 0;
      res.json({
        admins: adminUsers,
        students: studentUsers,
        setupRequired: !hasAdmins,
        note: hasAdmins ? "For security, passwords are not displayed. Contact your administrator for login credentials." : "No users configured. Please see SETUP_GUIDE.md for instructions on creating initial users securely using environment variables."
      });
    } catch (error) {
      console.error("Error fetching demo credentials:", error);
      res.status(500).json({ message: "Failed to fetch demo credentials" });
    }
  });
  app2.get("/api/statistics", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/students", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const noPagination = req.query.noPagination === "true";
      if (noPagination) {
        const students2 = await storage.getStudents();
        return res.json(students2);
      }
      const search = req.query.search || "";
      const offset = (page - 1) * limit;
      const db4 = getDb();
      const allStudents = await db4.select().from(students).orderBy(students.name);
      let filteredStudents = allStudents;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredStudents = allStudents.filter(
          (student) => student.name.toLowerCase().includes(searchLower) || student.email.toLowerCase().includes(searchLower)
        );
      }
      const paginatedStudents = filteredStudents.slice(offset, offset + limit);
      res.json({
        students: paginatedStudents,
        pagination: {
          page,
          limit,
          total: filteredStudents.length,
          totalPages: Math.ceil(filteredStudents.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  app2.post("/api/students", requireAdmin, async (req, res) => {
    try {
      console.log("Creating student with data:", req.body);
      if (!req.body.password || req.body.password.trim() === "") {
        return res.status(400).json({ message: "Password is required and cannot be empty" });
      }
      if (!req.body.email || req.body.email.trim() === "") {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!req.body.name || req.body.name.trim() === "") {
        return res.status(400).json({ message: "Name is required" });
      }
      if (!req.body.class || req.body.class.trim() === "") {
        return res.status(400).json({ message: "Class is required" });
      }
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), 10);
      const studentData = {
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        password: hashedPassword,
        class: req.body.class.trim(),
        phone: req.body.phone || null,
        address: req.body.address || null,
        guardianName: req.body.guardianName || null,
        guardianPhone: req.body.guardianPhone || null,
        profileImage: req.body.profileImage || null,
        enrollmentDate: req.body.enrollmentDate ? new Date(req.body.enrollmentDate) : /* @__PURE__ */ new Date(),
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null
      };
      console.log("Processed student data:", studentData);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      if (error && typeof error === "object" && "cause" in error) {
        const cause = error.cause;
        if (cause?.code === "23505") {
          if (cause.constraint_name === "students_email_unique") {
            return res.status(400).json({
              message: "A student with this email address already exists. Please use a different email address.",
              field: "email"
            });
          }
        }
      }
      res.status(500).json({
        message: "Failed to create student",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.put("/api/students/profile", requireStudent, async (req, res) => {
    try {
      const user = req.session?.user;
      console.log("Student profile update - Session user:", user);
      console.log("Student profile update - User role:", user?.role);
      if (!user || !user.studentId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      console.log("Updating student profile:", req.body);
      let updateData = {};
      if (req.body.name !== void 0) updateData.name = req.body.name.trim();
      if (req.body.email !== void 0) updateData.email = req.body.email.trim();
      if (req.body.phone !== void 0) updateData.phone = req.body.phone || null;
      if (req.body.address !== void 0) updateData.address = req.body.address || null;
      if (req.body.dateOfBirth !== void 0) updateData.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
      if (req.body.guardianName !== void 0) updateData.guardianName = req.body.guardianName || null;
      if (req.body.guardianPhone !== void 0) updateData.guardianPhone = req.body.guardianPhone || null;
      if (updateData.name && updateData.name === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      if (updateData.email && updateData.email === "") {
        return res.status(400).json({ error: "Email cannot be empty" });
      }
      const updatedStudent = await storage.updateStudent(user.studentId, updateData);
      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
      if (updateData.email) {
        req.session.user.email = updateData.email;
      }
      if (updateData.name) {
        req.session.user.name = updateData.name;
      }
      res.json({
        success: true,
        message: "Profile updated successfully",
        student: updatedStudent
      });
    } catch (error) {
      console.error("Error updating student profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app2.put("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating student with ID:", id, "Data:", req.body);
      let updateData = {};
      if (req.body.name !== void 0) updateData.name = req.body.name.trim();
      if (req.body.email !== void 0) updateData.email = req.body.email.trim();
      if (req.body.class !== void 0) updateData.class = req.body.class.trim();
      if (req.body.phone !== void 0) updateData.phone = req.body.phone || null;
      if (req.body.address !== void 0) updateData.address = req.body.address || null;
      if (req.body.guardianName !== void 0) updateData.guardianName = req.body.guardianName || null;
      if (req.body.guardianPhone !== void 0) updateData.guardianPhone = req.body.guardianPhone || null;
      if (req.body.profileImage !== void 0) updateData.profileImage = req.body.profileImage || null;
      if (req.body.enrollmentDate !== void 0) updateData.enrollmentDate = req.body.enrollmentDate ? new Date(req.body.enrollmentDate) : null;
      if (req.body.dateOfBirth !== void 0) updateData.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
      if (req.body.password !== void 0) {
        if (req.body.password.trim() === "") {
          return res.status(400).json({ message: "Password cannot be empty" });
        }
        updateData.password = await bcrypt.hash(req.body.password.trim(), 10);
      }
      console.log("Processed update data:", updateData);
      const student = await storage.updateStudent(id, updateData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.delete("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Deleting student with ID:", id);
      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/exams", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const noPagination = req.query.noPagination === "true";
      if (noPagination) {
        const exams2 = await storage.getExams();
        return res.json(exams2);
      }
      const search = req.query.search || "";
      const offset = (page - 1) * limit;
      const db4 = getDb();
      const allExams = await db4.select().from(exams).orderBy(desc2(exams.date), exams.name);
      let filteredExams = allExams;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredExams = allExams.filter(
          (exam) => exam.name.toLowerCase().includes(searchLower) || exam.subject.toLowerCase().includes(searchLower)
        );
      }
      const paginatedExams = filteredExams.slice(offset, offset + limit);
      res.json({
        exams: paginatedExams,
        pagination: {
          page,
          limit,
          total: filteredExams.length,
          totalPages: Math.ceil(filteredExams.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });
  app2.get("/api/exams/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await storage.getExam(id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      const user = req.session?.user;
      if (user?.role === "student" && exam.status === "active") {
        try {
          const paper = await paperFileStorage.getPaperByExamId(id);
          if (paper && paper.questions.length > 0) {
            const examWithQuestions = {
              ...exam,
              questions: paper.questions.map((q) => ({
                id: q.id,
                question: q.question,
                type: q.type,
                options: q.options,
                marks: q.marks,
                orderIndex: q.orderIndex
                // Don't include correctAnswer for students
              }))
            };
            return res.json(examWithQuestions);
          }
        } catch (error) {
          console.error("Error fetching questions for student:", error);
        }
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });
  app2.post("/api/exams", requireAdmin, async (req, res) => {
    try {
      const existingExams = await storage.getExams();
      const duplicateName = existingExams.find(
        (exam2) => exam2.name.toLowerCase() === req.body.name.toLowerCase()
      );
      if (duplicateName) {
        return res.status(400).json({
          message: "An exam with this name already exists. Please choose a different name."
        });
      }
      if (req.body.startTime) {
        const newStartTime = new Date(req.body.startTime);
        const duplicateStartTime = existingExams.find((exam2) => {
          if (exam2.startTime) {
            const existingStartTime = new Date(exam2.startTime);
            return existingStartTime.getTime() === newStartTime.getTime();
          }
          return false;
        });
        if (duplicateStartTime) {
          return res.status(400).json({
            message: "Another exam is already scheduled at this start time. Please choose a different time."
          });
        }
      }
      const examData = {
        ...req.body,
        date: new Date(req.body.date),
        startTime: req.body.startTime ? new Date(req.body.startTime) : null,
        duration: parseInt(req.body.duration),
        totalMarks: req.body.totalMarks ? parseInt(req.body.totalMarks) : 100,
        // Default to 100 if not provided
        status: "upcoming"
      };
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });
  app2.put("/api/exams/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentExam = await storage.getExam(id);
      if (!currentExam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (currentExam.status === "completed") {
        return res.status(400).json({
          message: "Cannot edit completed exams"
        });
      }
      if (currentExam.status === "active" && req.body.status === "upcoming") {
        return res.status(400).json({
          message: "Cannot change active exam back to upcoming status while students are taking it"
        });
      }
      if (req.body.name && req.body.name !== currentExam.name) {
        const existingExams = await storage.getExams();
        const duplicateName = existingExams.find(
          (exam2) => exam2.id !== id && exam2.name.toLowerCase() === req.body.name.toLowerCase()
        );
        if (duplicateName) {
          return res.status(400).json({
            message: "An exam with this name already exists. Please choose a different name."
          });
        }
      }
      if (req.body.startTime) {
        const newStartTime = new Date(req.body.startTime);
        const existingExams = await storage.getExams();
        const duplicateStartTime = existingExams.find((exam2) => {
          if (exam2.id !== id && exam2.startTime) {
            const existingStartTime = new Date(exam2.startTime);
            return existingStartTime.getTime() === newStartTime.getTime();
          }
          return false;
        });
        if (duplicateStartTime) {
          return res.status(400).json({
            message: "Another exam is already scheduled at this start time. Please choose a different time."
          });
        }
      }
      const isNameChanging = req.body.name && req.body.name !== currentExam.name;
      const examData = {
        ...req.body,
        ...req.body.date && { date: new Date(req.body.date) },
        ...req.body.startTime && { startTime: new Date(req.body.startTime) },
        ...req.body.duration && { duration: parseInt(req.body.duration) },
        ...req.body.totalMarks && { totalMarks: parseInt(req.body.totalMarks) }
      };
      const exam = await storage.updateExam(id, examData);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (isNameChanging) {
        try {
          await paperFileStorage.renamePaperFile(id, currentExam.name);
        } catch (error) {
        }
      }
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });
  app2.delete("/api/exams/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExam(id);
      if (!success) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json({ message: "Exam deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });
  app2.get("/api/debug/exam/:examId", async (req, res) => {
    try {
      const examId = parseInt(req.params.examId);
      const exam = await storage.getExam(examId);
      const { paperFileStorage: paperFileStorage2 } = await Promise.resolve().then(() => (init_paper_file_storage(), paper_file_storage_exports));
      const paper = await paperFileStorage2.getPaperByExamId(examId);
      const calculatedTotal = paper?.questions?.reduce((sum, q) => sum + q.marks, 0) || 0;
      res.json({
        exam: {
          id: exam?.id,
          name: exam?.name,
          currentTotalMarks: exam?.totalMarks
        },
        paper: {
          id: paper?.id,
          questionsCount: paper?.questions?.length || 0,
          questions: paper?.questions?.map((q) => ({ id: q.id, question: q.question.substring(0, 30), marks: q.marks })) || [],
          calculatedTotal
        },
        discrepancy: exam?.totalMarks !== calculatedTotal
      });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/admin/sync-exam-marks/:examId?", async (req, res) => {
    try {
      const { forceExamMarkSync: forceExamMarkSync2, syncAllExamMarks: syncAllExamMarks2 } = await Promise.resolve().then(() => (init_sync_exam_marks(), sync_exam_marks_exports));
      const examId = req.params.examId;
      if (examId) {
        const success = await forceExamMarkSync2(parseInt(examId));
        if (success) {
          res.json({ message: `Exam ${examId} marks synchronized successfully` });
        } else {
          res.status(500).json({ message: `Failed to sync exam ${examId} marks` });
        }
      } else {
        await syncAllExamMarks2();
        res.json({ message: "All exam marks synchronized successfully" });
      }
    } catch (error) {
      console.error("Error syncing exam marks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/exams/:id/submit", requireStudent, async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const { answers } = req.body;
      const user = req.session?.user;
      if (!user?.studentId) {
        return res.status(400).json({ message: "Student ID not found" });
      }
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.status !== "active") {
        return res.status(400).json({ message: "Exam is not currently active" });
      }
      const paper = await paperFileStorage.getPaperByExamId(examId);
      if (!paper || !paper.questions.length) {
        return res.status(404).json({ message: "No questions found for this exam" });
      }
      let score = 0;
      let attemptedQuestions = 0;
      let attemptedMarks = 0;
      for (const question of paper.questions) {
        const studentAnswer = answers[question.id];
        if (studentAnswer && studentAnswer.trim()) {
          attemptedQuestions++;
          attemptedMarks += question.marks;
          if (question.type === "multiple_choice" && question.correctAnswer) {
            if (studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
              score += question.marks;
            }
          } else if (question.type === "short_answer" || question.type === "essay") {
            score += question.marks;
          }
        }
      }
      const percentage = attemptedMarks > 0 ? Math.round(score / attemptedMarks * 100) : 0;
      const existingResults = await storage.getResultsByStudentId(user.studentId);
      const existingResult = existingResults.find((r) => r.examId === examId);
      let result;
      if (existingResult) {
        result = await storage.updateResult(existingResult.id, {
          score,
          percentage,
          submittedAt: /* @__PURE__ */ new Date(),
          answers: JSON.stringify(answers)
        });
      } else {
        result = await storage.createResult({
          studentId: user.studentId,
          examId,
          score,
          percentage,
          submittedAt: /* @__PURE__ */ new Date(),
          answers: JSON.stringify(answers)
        });
      }
      const allResults = await storage.getResultsByExamId(examId);
      const sortedResults = allResults.sort((a, b) => {
        const aPercentage = typeof a.percentage === "string" ? parseFloat(a.percentage) : Number(a.percentage || 0);
        const bPercentage = typeof b.percentage === "string" ? parseFloat(b.percentage) : Number(b.percentage || 0);
        return bPercentage - aPercentage;
      });
      const studentRank = sortedResults.findIndex((r) => r.studentId === user.studentId) + 1;
      try {
        await emailService.sendExamResultNotification(user.studentId, examId, score, exam.totalMarks);
      } catch (emailError) {
        console.error("Failed to send exam result email:", emailError);
      }
      try {
        const totalStudents = await storage.getStudents();
        const examResults = await storage.getResultsByExamId(examId);
        if (examResults.length >= totalStudents.length && exam.status === "active") {
          await storage.updateExam(examId, { status: "completed" });
          console.log(`Exam ${examId} automatically marked as completed - all students have finished`);
        }
      } catch (autoCompleteError) {
        console.error("Failed to check/update exam completion status:", autoCompleteError);
      }
      res.json({
        score,
        attemptedMarks,
        totalMarks: exam.totalMarks,
        percentage,
        rank: studentRank,
        totalParticipants: allResults.length,
        submittedAt: result?.submittedAt || /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error submitting exam:", error);
      res.status(500).json({ message: "Failed to submit exam" });
    }
  });
  app2.get("/api/results", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const noPagination = req.query.noPagination === "true";
      if (noPagination) {
        const results4 = await storage.getResults();
        return res.json(results4);
      }
      const search = req.query.search || "";
      const offset = (page - 1) * limit;
      const allResults = await storage.getResults();
      let filteredResults = allResults;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredResults = allResults.filter(
          (result) => result.student.name.toLowerCase().includes(searchLower) || result.exam.name.toLowerCase().includes(searchLower) || result.exam.subject.toLowerCase().includes(searchLower)
        );
      }
      const paginatedResults = filteredResults.slice(offset, offset + limit);
      res.json({
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: filteredResults.length,
          totalPages: Math.ceil(filteredResults.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });
  app2.post("/api/results", requireAdmin, async (req, res) => {
    try {
      const resultData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : /* @__PURE__ */ new Date()
      };
      const result = await storage.createResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Failed to create result" });
    }
  });
  app2.put("/api/results/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        ...req.body.submittedAt && { submittedAt: new Date(req.body.submittedAt) }
      };
      const result = await storage.updateResult(id, updateData);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating result:", error);
      res.status(500).json({ message: "Failed to update result" });
    }
  });
  app2.delete("/api/results/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteResult(id);
      if (!success) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json({ message: "Result deleted successfully" });
    } catch (error) {
      console.error("Error deleting result:", error);
      res.status(500).json({ message: "Failed to delete result" });
    }
  });
  app2.get("/api/student/dashboard", requireStudent, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user?.studentId) {
        return res.status(400).json({ message: "Student ID not found" });
      }
      const dashboardData = await storage.getStudentDashboardData(user.studentId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  app2.get("/api/papers/:examId", requireAdmin, async (req, res) => {
    try {
      const examId = parseInt(req.params.examId);
      let paper = await paperFileStorage.getPaperByExamId(examId);
      if (!paper) {
        const exam = await storage.getExam(examId);
        if (exam) {
          paper = {
            id: `paper_${examId}_new`,
            examId,
            title: `${exam.name} Question Paper`,
            instructions: "Read all questions carefully before answering.",
            totalQuestions: 0,
            totalMarks: 0,
            questions: [],
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            metadata: {
              examName: exam.name,
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
              version: "1.0"
            }
          };
        }
      }
      res.json(paper);
    } catch (error) {
      console.error("Error fetching paper:", error);
      res.status(500).json({ message: "Failed to fetch paper" });
    }
  });
  app2.post("/api/papers", requireAdmin, async (req, res) => {
    try {
      const examId = parseInt(req.body.examId);
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      const paperData = {
        title: req.body.title || exam.name,
        instructions: req.body.instructions || exam.description || "Read all questions carefully before answering.",
        totalQuestions: req.body.totalQuestions || 0,
        totalMarks: req.body.totalMarks || 0,
        questions: req.body.questions || [],
        examDetails: {
          name: exam.name,
          subject: exam.subject,
          date: exam.date.toISOString(),
          duration: exam.duration,
          status: exam.status,
          description: exam.description
        }
      };
      const paper = await paperFileStorage.savePaper(examId, paperData);
      res.status(201).json(paper);
    } catch (error) {
      console.error("Error creating paper:", error);
      res.status(500).json({ message: "Failed to create paper" });
    }
  });
  app2.put("/api/papers/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      let examId = req.body.examId;
      if (!examId && id.startsWith("paper_")) {
        const match = id.match(/paper_(\d+)_/);
        examId = match ? parseInt(match[1]) : null;
      }
      if (!examId) {
        return res.status(400).json({ message: "examId is required" });
      }
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.status === "completed") {
        return res.status(403).json({ message: "Cannot modify papers for completed exams" });
      }
      console.log("Updating paper with questions:", req.body.questions?.length || 0);
      if (req.body.questions && Array.isArray(req.body.questions)) {
        const paperData = {
          title: req.body.title,
          instructions: req.body.instructions || "",
          totalQuestions: parseInt(req.body.totalQuestions) || req.body.questions.length,
          totalMarks: parseInt(req.body.totalMarks) || req.body.questions.reduce((sum, q) => sum + (q.marks || 0), 0),
          questions: req.body.questions.map((q, index) => ({
            id: `question_${examId}_${Date.now()}_${index}`,
            question: q.question || q.questionText,
            type: q.type === "mcq" ? "multiple_choice" : q.type,
            marks: parseInt(q.marks) || 1,
            orderIndex: q.orderIndex !== void 0 ? parseInt(q.orderIndex) : index,
            options: q.options || (q.type === "mcq" ? [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) : void 0),
            correctAnswer: q.correctAnswer || null,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }))
        };
        const paper = await paperFileStorage.savePaper(parseInt(examId), paperData);
        if (!paper) {
          return res.status(500).json({ message: "Failed to save paper with questions" });
        }
        console.log("Paper saved with", paper.questions.length, "questions");
        broadcastUpdate("paper_updated", { examId: parseInt(examId), paperId: paper.id });
        broadcastUpdate("questions_updated", { examId: parseInt(examId), paperId: paper.id, action: "bulk_updated", count: paper.questions.length });
        res.json(paper);
      } else {
        const paper = await paperFileStorage.updatePaperDetails(parseInt(examId), {
          title: req.body.title,
          instructions: req.body.instructions
        });
        if (!paper) {
          return res.status(404).json({ message: "Paper not found" });
        }
        broadcastUpdate("paper_updated", { examId: parseInt(examId), paperId: paper.id });
        res.json(paper);
      }
    } catch (error) {
      console.error("Error updating paper:", error);
      res.status(500).json({ message: "Failed to update paper" });
    }
  });
  app2.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      console.log("Updating user profile:", req.body);
      let updateData = {};
      if (req.body.name !== void 0) updateData.name = req.body.name.trim();
      if (req.body.email !== void 0) updateData.email = req.body.email.trim();
      if (updateData.name && updateData.name === "") {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      if (updateData.email && updateData.email === "") {
        return res.status(400).json({ error: "Email cannot be empty" });
      }
      const updatedUser = await storage.updateUser(user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      req.session.user = { ...req.session.user, ...updateData };
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app2.get("/api/student/profile", requireStudent, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !user.studentId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      const student = await storage.getStudent(user.studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      const profileData = {
        id: student.id,
        name: student.name,
        email: student.email,
        class: student.class,
        enrollmentDate: student.enrollmentDate,
        phone: student.phone,
        address: student.address,
        dateOfBirth: student.dateOfBirth,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        profileImage: user.profileImage || null
      };
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  app2.put("/api/student/notifications", requireStudent, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !user.studentId) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      const updateData = {
        emailNotifications: req.body.emailNotifications ?? false,
        emailExamResults: req.body.emailExamResults ?? false,
        emailUpcomingExams: req.body.emailUpcomingExams ?? false
      };
      const db4 = getDb();
      const userRecords = await db4.select().from(users).where(eq6(users.studentId, user.studentId)).limit(1);
      if (userRecords.length === 0) {
        const student = await storage.getStudent(user.studentId);
        if (!student) {
          return res.status(404).json({ error: "Student not found" });
        }
        const userData = {
          name: student.name,
          email: student.email,
          password: student.password,
          role: "student",
          studentId: student.id,
          ...updateData
        };
        const createdUser = await storage.createUser(userData);
        Object.assign(req.session.user, updateData);
        return res.json({
          success: true,
          message: "Notification settings updated successfully"
        });
      }
      const userRecord = userRecords[0];
      const updatedUser = await storage.updateUser(userRecord.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Failed to update user" });
      }
      Object.assign(req.session.user, updateData);
      Object.assign(req.session.user, updateData);
      res.json({
        success: true,
        message: "Notification settings updated successfully"
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });
  app2.post("/api/student/change-password", requireStudent, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "Student not authenticated" });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }
      const student = await storage.getStudent(user.studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateStudent(user.studentId, { password: hashedPassword });
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("Error changing student password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.post("/api/users/change-password", requireAuth, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }
      const fullUser = await storage.getUserByEmail(user.email);
      if (!fullUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, fullUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await storage.updateUser(user.id, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update password" });
      }
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });
  app2.put("/api/users/notifications", requireAuth, async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      console.log("Updating user notifications:", req.body);
      const updateData = {};
      if (req.body.emailNotifications !== void 0) updateData.emailNotifications = req.body.emailNotifications;
      if (req.body.emailExamResults !== void 0) updateData.emailExamResults = req.body.emailExamResults;
      if (req.body.emailUpcomingExams !== void 0) updateData.emailUpcomingExams = req.body.emailUpcomingExams;
      const updatedUser = await storage.updateUser(user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      req.session.user = { ...req.session.user, ...updateData };
      res.json({
        emailNotifications: updatedUser.emailNotifications,
        emailExamResults: updatedUser.emailExamResults,
        emailUpcomingExams: updatedUser.emailUpcomingExams
      });
    } catch (error) {
      console.error("Error updating user notifications:", error);
      res.status(500).json({ error: "Failed to update notifications" });
    }
  });
  app2.post("/api/email/test", requireAdmin, async (req, res) => {
    try {
      const { testEmail } = req.body;
      if (!testEmail) {
        return res.status(400).json({ error: "Test email address is required" });
      }
      const success = await emailService.testEmailConnection(testEmail);
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ error: "Failed to send test email" });
    }
  });
  app2.post("/api/email/upcoming-exam/:examId", requireAdmin, async (req, res) => {
    try {
      const examId = parseInt(req.params.examId);
      const { studentId } = req.body;
      if (studentId) {
        const result = await emailService.sendUpcomingExamNotification(studentId, examId);
        if (result.success) {
          res.json({ message: "Exam reminder sent successfully" });
        } else {
          const statusCode = result.error && result.error.includes("disabled") ? 400 : 500;
          res.status(statusCode).json({ error: result.error || "Failed to send exam reminder" });
        }
      } else {
        const result = await emailService.sendBulkUpcomingExamNotifications(examId);
        const response = {
          message: `Exam reminders sent to ${result.sent} students`,
          sent: result.sent,
          failed: result.failed
        };
        if (result.errors && result.errors.length > 0) {
          response.errors = result.errors;
        }
        res.json(response);
      }
    } catch (error) {
      console.error("Error sending exam reminders:", error);
      res.status(500).json({ error: "Failed to send exam reminders due to a system error" });
    }
  });
  registerQuestionRoutes(app2, requireAdmin, broadcastUpdate);
  registerProfileRoutes(app2, requireAuth, requireAdmin, requireStudent);
  return httpServer;
}

// server/setup-database.ts
init_db_connection();
init_schema();
import bcrypt2 from "bcrypt";
import { eq as eq7 } from "drizzle-orm";
var db3 = getDb();
async function setupInitialData() {
  try {
    try {
      await db3.execute(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='password') THEN
            ALTER TABLE students ADD COLUMN password TEXT;
          END IF;
        END $$;
      `);
    } catch (error) {
    }
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    const initialAdminName = process.env.INITIAL_ADMIN_NAME || "Administrator";
    if (initialAdminEmail && initialAdminPassword) {
      const existingAdmin = await db3.select().from(users).where(eq7(users.email, initialAdminEmail)).limit(1);
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt2.hash(initialAdminPassword, 10);
        await db3.insert(users).values({
          email: initialAdminEmail,
          password: hashedPassword,
          name: initialAdminName,
          role: "admin",
          isAdmin: true,
          profileImage: null,
          studentId: null,
          emailNotifications: true,
          emailExamResults: true,
          emailUpcomingExams: true
        });
        console.log(`Initial admin user created: ${initialAdminEmail}`);
      }
    } else {
      const adminCount = await db3.select().from(users).where(eq7(users.role, "admin")).limit(1);
      if (adminCount.length === 0) {
        console.warn("\n\u26A0\uFE0F  WARNING: No admin users exist and no initial admin credentials are configured!");
        console.warn("To create an initial admin user, set the following environment variables:");
        console.warn("  INITIAL_ADMIN_EMAIL - The email address for the admin");
        console.warn("  INITIAL_ADMIN_PASSWORD - A strong password for the admin");
        console.warn("  INITIAL_ADMIN_NAME (optional) - The display name for the admin\n");
      }
    }
    const initialStudentEmail = process.env.INITIAL_STUDENT_EMAIL;
    const initialStudentPassword = process.env.INITIAL_STUDENT_PASSWORD;
    if (initialStudentEmail && initialStudentPassword) {
      let studentRecord = await db3.select().from(students).where(eq7(students.email, initialStudentEmail)).limit(1);
      if (studentRecord.length === 0) {
        const hashedPassword = await bcrypt2.hash(initialStudentPassword, 10);
        const newStudent = await db3.insert(students).values({
          name: process.env.INITIAL_STUDENT_NAME || "Sample Student",
          email: initialStudentEmail,
          password: hashedPassword,
          class: process.env.INITIAL_STUDENT_CLASS || "12th Grade",
          enrollmentDate: /* @__PURE__ */ new Date(),
          phone: process.env.INITIAL_STUDENT_PHONE || "000-000-0000",
          address: process.env.INITIAL_STUDENT_ADDRESS || "Not specified",
          dateOfBirth: /* @__PURE__ */ new Date("2005-01-15"),
          guardianName: process.env.INITIAL_STUDENT_GUARDIAN || "Guardian Name",
          guardianPhone: process.env.INITIAL_STUDENT_GUARDIAN_PHONE || "000-000-0000",
          profileImage: null
        }).returning();
        studentRecord = newStudent;
        const existingStudentUser = await db3.select().from(users).where(eq7(users.email, initialStudentEmail)).limit(1);
        if (existingStudentUser.length === 0) {
          await db3.insert(users).values({
            email: initialStudentEmail,
            password: hashedPassword,
            name: process.env.INITIAL_STUDENT_NAME || "Sample Student",
            role: "student",
            isAdmin: false,
            profileImage: null,
            studentId: studentRecord[0].id,
            emailNotifications: true,
            emailExamResults: true,
            emailUpcomingExams: true
          });
        }
        console.log(`Initial student user created: ${initialStudentEmail}`);
      }
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

// server/migrate-students.ts
init_db_connection();
init_schema();
import { eq as eq8 } from "drizzle-orm";
async function migrateStudentsToUsers() {
  const db4 = getDb();
  try {
    const allStudents = await db4.select().from(students);
    console.log(`Found ${allStudents.length} students to check for user records`);
    let created = 0;
    for (const student of allStudents) {
      const existingUserByStudentId = await db4.select().from(users).where(eq8(users.studentId, student.id)).limit(1);
      const existingUserByEmail = await db4.select().from(users).where(eq8(users.email, student.email)).limit(1);
      if (existingUserByStudentId.length === 0 && existingUserByEmail.length === 0) {
        const userData = {
          name: student.name,
          email: student.email,
          password: student.password,
          // Password should already be hashed
          role: "student",
          studentId: student.id,
          emailNotifications: true,
          smsNotifications: false,
          emailExamResults: true,
          emailUpcomingExams: true,
          smsExamResults: false,
          smsUpcomingExams: false,
          profileImage: student.profileImage
        };
        await db4.insert(users).values(userData);
        created++;
        console.log(`Created user record for student: ${student.name} (${student.email})`);
      } else if (existingUserByEmail.length > 0 && existingUserByStudentId.length === 0) {
        await db4.update(users).set({ studentId: student.id }).where(eq8(users.email, student.email));
        console.log(`Linked existing user to student: ${student.name} (${student.email})`);
      }
    }
    console.log(`Migration complete. Created ${created} user records.`);
    return { success: true, created };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}

// server/create-tables.ts
init_db_connection();
import fs2 from "fs";
import path3 from "path";
async function createTablesIfNotExist() {
  const db4 = getDb();
  try {
    console.log("Checking if database tables exist...");
    const tableCheck = await db4.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as users_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'students'
      ) as students_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'exams'
      ) as exams_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'results'
      ) as results_exists;
    `);
    const tableExists = tableCheck[0];
    const allTablesExist = tableExists.users_exists && tableExists.students_exists && tableExists.exams_exists && tableExists.results_exists;
    if (!allTablesExist) {
      console.log("Some tables are missing. Creating tables...");
      const migrationPath = path3.join(process.cwd(), "migrations", "0003_complete_database_schema.sql");
      const migrationSQL = fs2.readFileSync(migrationPath, "utf8");
      const statements = migrationSQL.split("--> statement-breakpoint");
      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          try {
            await db4.execute(trimmedStatement);
          } catch (error) {
            if (!error.message?.includes("already exists") && !error.message?.includes("duplicate_object")) {
              console.error("Error executing statement:", error.message);
            }
          }
        }
      }
      console.log("\u2713 Database tables created successfully");
    } else {
      console.log("\u2713 All database tables already exist");
    }
  } catch (error) {
    console.error("Error checking/creating tables:", error);
    throw error;
  }
}

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express2();
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await createTablesIfNotExist();
  await setupInitialData();
  await migrateStudentsToUsers();
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: new (MemoryStore(session))({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      secure: false,
      // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const server = createServer2(app);
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
