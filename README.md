# Petty Cash Management System

ระบบจัดการเงินสดย่อย (Petty Cash) สำหรับการจัดการค่าใช้จ่ายขนาดเล็กในองค์กร

## คุณสมบัติ

- **การบันทึกค่าใช้จ่าย**: บันทึกรายละเอียดค่าใช้จ่าย เช่น วันที่, จำนวนเงิน, รายละเอียด, ประเภทค่าใช้จ่าย, ผู้ขอ, และหมายเหตุ
- **การจัดการรายการ**: แสดงรายการทั้งหมดในรูปแบบตาราง พร้อมการเปลี่ยนสถานะและการลบรายการ
- **การสร้างรายงาน**: สร้างรายงานสรุป รายงานตามประเภทค่าใช้จ่าย และรายงานตามผู้ขอ
- **การส่งออกข้อมูล**: ส่งออกรายงานเป็นไฟล์ CSV สำหรับการวิเคราะห์เพิ่มเติม

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
bun install
```

2. รันเซิร์ฟเวอร์สำหรับการพัฒนา:
```bash
bun dev
```

3. เข้าถึงแอปพลิเคชันที่ http://localhost:3000

## การทดสอบ

### Unit Tests
```bash
bun test
```

### End-to-End Tests
```bash
bun test:e2e
```

## โครงสร้างโปรเจค

```
petty-cash/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page with tab navigation
│   ├── components/           # React components
│   │   ├── PettyCashForm.tsx # Form for creating new entries
│   │   ├── PettyCashList.tsx # Table for displaying entries
│   │   └── ReportGenerator.tsx # Component for generating reports
│   ├── services/             # Business logic
│   │   ├── petty-cash.service.ts # Service for managing entries
│   │   └── report.service.ts # Service for generating reports
│   └── types/                # TypeScript type definitions
│       └── petty-cash.ts     # Types for the application
├── e2e/                      # End-to-end tests
│   └── petty-cash.spec.ts    # E2E tests for the application
├── public/                   # Static assets
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## การใช้งาน

### การบันทึกรายการใหม่
1. คลิกที่แท็บ "New Entry"
2. กรอกข้อมูลในฟอร์ม:
   - วันที่
   - จำนวนเงิน
   - รายละเอียด
   - ประเภทค่าใช้จ่าย
   - ผู้ขอ
   - หมายเหตุ (ถ้ามี)
3. คลิกปุ่ม "Submit" เพื่อบันทึกรายการ

### การจัดการรายการ
1. คลิกที่แท็บ "List Entries"
2. ดูรายการทั้งหมดในตาราง
3. เปลี่ยนสถานะรายการโดยใช้ dropdown
4. ลบรายการโดยคลิกปุ่ม "Delete" และยืนยันการลบ

### การสร้างรายงาน
1. คลิกที่แท็บ "Reports"
2. เลือกประเภทรายงาน:
   - Summary Report: รายงานสรุปรวม
   - Category Report: รายงานตามประเภทค่าใช้จ่าย
   - Requester Report: รายงานตามผู้ขอ
3. เลือกช่วงวันที่
4. เลือกประเภทค่าใช้จ่ายหรือผู้ขอ (ถ้าจำเป็น)
5. คลิกปุ่ม "Generate Report" เพื่อสร้างรายงาน
6. คลิกปุ่ม "Export to CSV" เพื่อส่งออกรายงาน

## การพัฒนาเพิ่มเติม

- **การเชื่อมต่อฐานข้อมูล**: ปรับปรุงให้ใช้ฐานข้อมูลจริงแทนการเก็บข้อมูลในหน่วยความจำ
- **การเพิ่มระบบ Authentication**: เพิ่มระบบยืนยันตัวตนสำหรับผู้ใช้
- **การเพิ่มการอัปโหลดใบเสร็จ**: เพิ่มความสามารถในการอัปโหลดและแนบใบเสร็จ
- **การเพิ่มการแจ้งเตือน**: เพิ่มระบบแจ้งเตือนสำหรับการอนุมัติและการปฏิเสธรายการ
- **การเพิ่มการวิเคราะห์ข้อมูล**: เพิ่มกราฟและการวิเคราะห์ข้อมูลเพิ่มเติมในรายงาน
