const communicationRepository = require('./communication.repository');
const SMS = require('./models/sms.model');
const Email = require('./models/email.model');
const Notification = require('./models/notification.model');
const CommunicationHistory = require('./models/communication-history.model');
const mongoose = require('mongoose');

class NotificationService {
  // 1. Student Admission
  async sendAdmissionSuccess(student) {
    const title = 'Admission Confirmed successfully';
    const message = `Welcome ${student.firstName} ${student.lastName}! Your admission to Grade ${student.class}-${student.section} has been confirmed. Admission No: ${student.admissionNo}.`;
    
    await this._dispatchAllChannels({
      recipientId: student._id,
      recipientRole: 'student',
      title,
      message,
      phone: student.phone || '9999999999',
      email: student.email || 'student@school.com',
      module: 'Student Management'
    });
  }

  // 2. Attendance Marked (Absent Alert)
  async sendAbsentAlert(attendance) {
    const title = 'Attendance Alert: Absent today';
    const message = `Dear Parent, your child was marked ABSENT today. Status: absent. Please provide a leave note if applicable.`;

    await this._dispatchAllChannels({
      recipientId: attendance.studentId,
      recipientRole: 'parent',
      title,
      message,
      phone: '9876543210',
      email: 'parent@school.com',
      module: 'Attendance Module'
    });
  }

  // 3. Fee Assigned
  async sendFeeReminder(invoice) {
    const title = 'Tuition Invoice Generated';
    const message = `Invoice ${invoice.invoiceNo || 'INV-001'} for Term Fees has been generated. Amount: $${invoice.totalAmount}. Due Date: ${invoice.dueDate || 'N/A'}.`;

    await this._dispatchAllChannels({
      recipientId: invoice.studentId,
      recipientRole: 'parent',
      title,
      message,
      phone: '9876543210',
      email: 'parent@school.com',
      module: 'Fees & Billing'
    });
  }

  // 4. Payment Completed
  async sendFeePaymentSuccess(invoice) {
    const title = 'Fee Payment Successful';
    const message = `Payment of $${invoice.paidAmount} received for Invoice ${invoice.invoiceNo || 'INV-001'}. Thank you.`;

    await this._dispatchAllChannels({
      recipientId: invoice.studentId,
      recipientRole: 'parent',
      title,
      message,
      phone: '9876543210',
      email: 'parent@school.com',
      module: 'Fees & Billing'
    });
  }

  // 5. Exam Scheduled
  async sendExamScheduled(exam) {
    const title = 'Examination Schedule Released';
    const message = `Exam schedule for Term: ${exam.term || 'First Term'} (Grade ${exam.class}) is now published.`;

    await this._dispatchAllChannels({
      recipientRole: 'student',
      title,
      message,
      phone: '9999999999',
      email: 'student@school.com',
      module: 'Examination Module'
    });
  }

  // 6. Results Published
  async sendResultPublished(examResult) {
    const title = 'Exam Results Published';
    const message = `Term Exam results for Grade ${examResult.class} have been declared. Marks are available on portal.`;

    await this._dispatchAllChannels({
      recipientId: examResult.studentId,
      recipientRole: 'student',
      title,
      message,
      phone: '9999999999',
      email: 'student@school.com',
      module: 'Examination Module'
    });
  }

  // 7. Library Due Date Reminder
  async sendLibraryDueReminder(issueBook) {
    const title = 'Library Book Return Reminder';
    const message = `Book "${issueBook.bookTitle || 'Standard text'}" is due for return. Please return it to avoid fine.`;

    await this._dispatchAllChannels({
      recipientId: issueBook.borrowerId,
      recipientRole: 'student',
      title,
      message,
      phone: '9999999999',
      email: 'student@school.com',
      module: 'Library Module'
    });
  }

  // 8. Transport Route Changed
  async sendTransportRouteChanged(route) {
    const title = 'Transport Route Update';
    const message = `Route ${route.routeName || 'Standard Route'} pickup time updated to ${route.pickupTime || 'N/A'}.`;

    await this._dispatchAllChannels({
      recipientRole: 'student',
      title,
      message,
      phone: '9999999999',
      email: 'student@school.com',
      module: 'Transport Module'
    });
  }

  // 9. Teacher Leave Approved
  async sendLeaveApproved(leave) {
    const title = 'Leave Request Approved';
    const message = `Your leave request starting ${leave.startDate || 'N/A'} is APPROVED. Status: approved.`;

    await this._dispatchAllChannels({
      recipientId: leave.applicantId,
      recipientRole: 'teacher',
      title,
      message,
      phone: '9876543212',
      email: 'teacher@school.com',
      module: 'Leave Management'
    });
  }

  // 10. Payroll Completed (Payslip Generated)
  async sendPayslipGenerated(payslip) {
    const title = 'Payslip Generated successfully';
    const message = `Your payslip for Month ${payslip.workingDays} days has been compiled. Net Payout: $${payslip.netSalary}.`;

    await this._dispatchAllChannels({
      recipientId: payslip.teacherId,
      recipientRole: 'teacher',
      title,
      message,
      phone: '9876543212',
      email: 'teacher@school.com',
      module: 'Payroll Module'
    });
  }

  // 11. Event Created
  async sendEventCreated(event) {
    const title = 'New Event Scheduled';
    const message = `Event: "${event.name}" will take place at ${event.venue} on ${new Date(event.date).toLocaleDateString()}.`;

    await this._dispatchAllChannels({
      recipientRole: 'all',
      title,
      message,
      phone: '9999999999',
      email: 'all@school.com',
      module: 'Event Planner'
    });
  }

  // ─── PRIVATE CHANNEL DISPATCHER ───────────────────────────────────────────
  async _dispatchAllChannels({ recipientId, recipientRole = 'student', title, message, phone, email, module }) {
    const targetRecipientId = recipientId || new mongoose.Types.ObjectId();

    // 1. Push Notification
    await Notification.create({
      recipientId: targetRecipientId,
      recipientRole,
      title,
      message,
      status: 'unread'
    });

    // 2. SMS log
    await SMS.create({
      recipientId: targetRecipientId,
      recipientPhone: phone,
      message,
      status: 'delivered',
      type: 'individual'
    });

    // 3. Email log
    await Email.create({
      recipientId: targetRecipientId,
      recipientEmail: email,
      subject: title,
      content: `<p>${message}</p>`,
      status: 'delivered',
      type: 'individual'
    });

    // 4. Communication History Log
    await CommunicationHistory.create({
      type: 'push',
      sender: 'Notification Engine',
      recipientCount: 1,
      successCount: 1,
      failedCount: 0,
      subject: title,
      content: message
    });
  }
}

module.exports = new NotificationService();
