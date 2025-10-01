/* resources/js/pages/dashboard.tsx */
import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';

import { Application }      from '@/types/application';
import { MoveIn }           from '@/types/move-in';
import { MoveOut }          from '@/types/move-out';
import { NoticeAndEviction }from '@/types/NoticeAndEviction';
import { OfferRenewal }     from '@/types/OfferRenewal';
import { Payment }          from '@/types/payments';
import { PaymentPlan }      from '@/types/PaymentPlan';
import { Tenant }           from '@/types/tenant';
import { VendorTaskTracker }from '@/types/vendor-task-tracker';
import { Unit }             from '@/types/unit';

type Props = {
  units: string[];
  selectedUnit: string | null;
  unitRecord:   Unit|null;
  application:  Application|null;
  moveIn:       MoveIn|null;
  moveOut:      MoveOut|null;
  notice:       NoticeAndEviction|null;
  offer:        OfferRenewal|null;
  payment:      Payment|null;
  paymentPlan:  PaymentPlan|null;
  tenant:       Tenant|null;
  vendorTask:   VendorTaskTracker|null;
};

export default function Dashboard({
  units, selectedUnit,
  unitRecord, application, moveIn, moveOut,
  notice, offer, payment, paymentPlan, tenant, vendorTask,
}: Props) {
  const changeUnit = (value: string) =>
    router.get(route('dashboard', { unit: value }), {}, { preserveScroll: true });

  const fmtDate = (d: string|null) =>
    d ? new Date(d).toLocaleDateString() : '—';

  const money = (n: any) =>
    n == null ? '—' : `$${Number(n).toLocaleString(undefined,{minimumFractionDigits:2})}`;

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
      <Head title="Dashboard" />

      {/* selector */}
      <div className="max-w-xs px-4 pt-4">
        <Select
          defaultValue={selectedUnit ?? units[0]}
          onValueChange={changeUnit}
        >
          <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
          <SelectContent>
            {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">

        {/* ---------- UNIT ---------- */}
        {unitRecord && (
  <Card>
    <CardHeader>
      <CardTitle>Unit — {unitRecord.unit_name}</CardTitle>
    </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
        <F l="City"                 v={unitRecord.city} />
        <F l="Property"             v={unitRecord.property} />
        <F l="Tenants"              v={unitRecord.tenants ?? '—'} />
        <F l="Beds"                 v={unitRecord.count_beds ?? '—'} />
        <F l="Baths"                v={unitRecord.count_baths ?? '—'} />
        <F l="Lease Start"          v={unitRecord.lease_start ? new Date(unitRecord.lease_start).toLocaleDateString() : '—'} />
        <F l="Lease End"            v={unitRecord.lease_end ? new Date(unitRecord.lease_end).toLocaleDateString() : '—'} />
        <F l="Lease Status"         v={unitRecord.lease_status ?? '—'} />
        <F l="Monthly Rent"         v={unitRecord.formatted_monthly_rent} />
        <F l="Recurring Txn"        v={unitRecord.recurring_transaction ?? '—'} />
        <F l="Utility Status"       v={unitRecord.utility_status ?? '—'} />
        <F l="Account #"            v={unitRecord.account_number ?? '—'} />
        <F l="Insurance"            v={unitRecord.insurance ?? '—'} />
        <F l="Insurance Exp."       v={unitRecord.insurance_expiration_date ? new Date(unitRecord.insurance_expiration_date).toLocaleDateString() : '—'} />
        <F l="Vacant"               v={unitRecord.vacant} />
        <F l="Listed"               v={unitRecord.listed} />
        <F l="Total Applications"   v={unitRecord.total_applications} />
        <F l="Created At"           v={new Date(unitRecord.created_at).toLocaleDateString()} />
        <F l="Updated At"           v={new Date(unitRecord.updated_at).toLocaleDateString()} />
        </CardContent>
    </Card>
    )}

        {/* ---------- APPLICATION ---------- */}
        {application && (
          <Card><CardHeader><CardTitle>Application</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Applicant" v={application.name}/>
              <F l="City" v={application.city}/>
              <F l="Property" v={application.property}/>
              <F l="Unit" v={application.unit}/>
              <F l="Co-signer" v={application.co_signer}/>
              <F l="Status" v={<Status b={application.status}/>}/>
              <F l="Stage" v={application.stage_in_progress}/>
              <F l="Date" v={fmtDate(application.date)}/>
              {application.notes && <F l="Notes" full v={application.notes}/>}
              {application.attachment_name && (
                <F l="Attachment" full v={
                  <a
                    href={`/applications/${application.id}/download`}
                    className="inline-flex items-center gap-1 text-primary underline"
                  >
                    <FileText size={16}/>{application.attachment_name}
                  </a>
                }/>
              )}
            </CardContent>
          </Card>
        )}

        {/* ---------- MOVE-IN ---------- */}
        {moveIn && (
          <Card><CardHeader><CardTitle>Move-In</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Signed Lease" v={<YN v={moveIn.signed_lease}/>}/>
              <F l="Lease Sign Date" v={fmtDate(moveIn.lease_signing_date)}/>
              <F l="Move-In Date"  v={fmtDate(moveIn.move_in_date)}/>
              <F l="Paid Sec+1st Rent" v={<YN v={moveIn.paid_security_deposit_first_month_rent}/>}/>
              <F l="Paid on" v={fmtDate(moveIn.scheduled_paid_time)}/>
              <F l="Handled Keys" v={<YN v={moveIn.handled_keys}/>}/>
              <F l="Form Sent" v={fmtDate(moveIn.move_in_form_sent_date)}/>
              <F l="Form Filled" v={<YN v={moveIn.filled_move_in_form}/>}/>
              <F l="Form Filled Date" v={fmtDate(moveIn.date_of_move_in_form_filled)}/>
              <F l="Insurance" v={<YN v={moveIn.submitted_insurance}/>}/>
              <F l="Insurance Exp." v={fmtDate(moveIn.date_of_insurance_expiration)}/>
            </CardContent>
          </Card>
        )}

        {/* ---------- MOVE-OUT ---------- */}
        {moveOut && (
          <Card><CardHeader><CardTitle>Move-Out</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Tenant" v={moveOut.tenants_name}/>
              <F l="Move-Out Date" v={fmtDate(moveOut.move_out_date)}/>
              <F l="Lease Status" v={moveOut.lease_status}/>
              <F l="Lease End (Buildium)" v={fmtDate(moveOut.date_lease_ending_on_buildium)}/>
              <F l="Keys Location" v={moveOut.keys_location}/>
              <F l="Utilities Under Our Name" v={<YN v={moveOut.utilities_under_our_name}/>}/>
              <F l="Utility Date" v={fmtDate(moveOut.date_utility_put_under_our_name)}/>
              <F l="Walkthrough" v={moveOut.walkthrough}/>
              <F l="Repairs" v={moveOut.repairs}/>
              <F l="Cleaning" v={moveOut.cleaning}/>
              <F l="Move-Out Form" v={moveOut.move_out_form}/>
              <F l="List Unit" v={moveOut.list_the_unit}/>
              <F l="Send Back Deposit" v={moveOut.send_back_security_deposit}/>
              {moveOut.notes && <F l="Notes" full v={moveOut.notes}/>}
            </CardContent>
          </Card>
        )}

        {/* ---------- NOTICE / EVICTION ---------- */}
        {notice && (
        <Card>
            <CardHeader>
            <CardTitle>Notice / Eviction</CardTitle>
            </CardHeader>

            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <F l="Type"            v={notice.type_of_notice ?? '—'} />
            <F l="Status"          v={<Status b={notice.status ?? null} />} />
            <F l="Date"            v={fmtDate(notice.date ?? null)} />
            <F l="Exception"       v={<YN v={notice.have_an_exception ?? null} />} />
            <F l="Evictions"       v={notice.evictions ?? '—'} />
            <F l="Sent to Attorney"v={<YN v={notice.sent_to_atorney ?? null} />} />
            <F l="Hearing"         v={fmtDate(notice.hearing_dates ?? null)} />
            <F l="Evicted/Plan"    v={notice.evected_or_payment_plan ?? '—'} />
            <F l="Left"            v={<YN v={notice.if_left ?? null} />} />
            <F l="Writ Date"       v={fmtDate(notice.writ_date ?? null)} />

            {notice.note && <F l="Note" full v={notice.note} />}

            {/* timestamps */}
            <F l="Created At" v={notice.created_at ? new Date(notice.created_at).toLocaleDateString() : '—'} />
            <F l="Updated At" v={notice.updated_at ? new Date(notice.updated_at).toLocaleDateString() : '—'} />
            </CardContent>
        </Card>
        )}

        {/* ---------- OFFER / RENEWAL ---------- */}
{offer && (
  <Card>
    <CardHeader>
      <CardTitle>Offer & Renewal</CardTitle>
    </CardHeader>

    <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
      <F l="Status"          v={<Status b={offer.status ?? null} />} />
      <F l="Sent"            v={fmtDate(offer.date_sent_offer ?? null)} />
      <F l="Accepted"        v={fmtDate(offer.date_of_acceptance ?? null)} />
      <F l="Days Left"       v={offer.how_many_days_left ?? '—'} />
      <F l="Expired"         v={offer.expired ?? '—'} />

      <F l="Lease Sent"      v={<YN v={offer.lease_sent ?? null} />} />
      <F l="Date Sent Lease" v={fmtDate(offer.date_sent_lease ?? null)} />
      <F l="Lease Signed"    v={<YN v={offer.lease_signed ?? null} />} />
      <F l="Date Signed"     v={fmtDate(offer.date_signed ?? null)} />

      <F l="Last Notice"     v={fmtDate(offer.last_notice_sent ?? null)} />
      <F l="Notice Kind"     v={offer.notice_kind ?? '—'} />
      <F l="Last Notice 2"   v={fmtDate(offer.last_notice_sent_2 ?? null)} />
      <F l="Notice Kind 2"   v={offer.notice_kind_2 ?? '—'} />

      {offer.notes && <F l="Notes" full v={offer.notes} />}

      {/* timestamps */}
      <F l="Created At" v={offer.created_at ? new Date(offer.created_at).toLocaleDateString() : '—'} />
      <F l="Updated At" v={offer.updated_at ? new Date(offer.updated_at).toLocaleDateString() : '—'} />
    </CardContent>
  </Card>
)}

        {/* ---------- PAYMENT ---------- */}
        {payment && (
          <Card><CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
              <F l="Date" v={fmtDate(payment.date)}/>
              <F l="Status" v={<Status b={payment.status}/>}/>
              <F l="Owes" v={money(payment.owes)}/>
              <F l="Paid" v={money(payment.paid)}/>
              <F l="Left to Pay" v={money(payment.left_to_pay)}/>
              <F l="Reversed" full v={payment.reversed_payments}/>
              <F l="Permanent" v={<YN v={payment.permanent}/>}/>
              {payment.notes && <F l="Notes" full v={payment.notes}/>}
            </CardContent>
          </Card>
        )}

        {/* ---------- PAYMENT PLAN ---------- */}
        {paymentPlan && (
          <Card><CardHeader><CardTitle>Payment Plan</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Property" v={paymentPlan.property}/>
              <F l="Tenant" v={paymentPlan.tenant}/>
              <F l="Date" v={fmtDate(paymentPlan.dates)}/>
              <F l="Amount" v={money(paymentPlan.amount)}/>
              <F l="Paid" v={money(paymentPlan.paid)}/>
              <F l="Left to Pay" v={money(paymentPlan.left_to_pay)}/>
              <F l="Status" v={<Status b={paymentPlan.status}/>}/>
              {paymentPlan.notes && <F l="Notes" full v={paymentPlan.notes}/>}
            </CardContent>
          </Card>
        )}

        {/* ---------- TENANT ---------- */}
        {tenant && (
          <Card><CardHeader><CardTitle>Tenant</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Name" v={`${tenant.first_name} ${tenant.last_name}`}/>
              <F l="Property" v={tenant.property_name}/>
              <F l="Unit" v={tenant.unit_number}/>
              <F l="Login Email" v={tenant.login_email}/>
              <F l="Alt Email" v={tenant.alternate_email}/>
              <F l="Mobile" v={tenant.mobile}/>
              <F l="Emergency Phone" v={tenant.emergency_phone}/>
              <F l="Cash / Check" v={tenant.cash_or_check}/>
              <F l="Has Insurance" v={tenant.has_insurance}/>
              <F l="Sensitive Comm." v={tenant.sensitive_communication}/>
              <F l="Has Assistance" v={tenant.has_assistance}/>
              {tenant.has_assistance==='Yes' && (
                <>
                  <F l="Assist Amt." v={money(tenant.assistance_amount)}/>
                  <F l="Assist Company" v={tenant.assistance_company}/>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ---------- VENDOR TASK ---------- */}
        {vendorTask && (
          <Card><CardHeader><CardTitle>Vendor Task</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <F l="Vendor" v={vendorTask.vendor_name}/>
              <F l="City" v={vendorTask.city}/>
              <F l="Unit" v={vendorTask.unit_name}/>
              <F l="Status" v={<Status b={vendorTask.status}/>}/>
              <F l="Urgent" v={<YN v={vendorTask.urgent}/>}/>
              <F l="Submission Date" v={fmtDate(vendorTask.task_submission_date)}/>
              <F l="Scheduled Visit" v={fmtDate(vendorTask.any_scheduled_visits)}/>
              <F l="Task End" v={fmtDate(vendorTask.task_ending_date)}/>
              <F l="Tasks" full v={vendorTask.assigned_tasks}/>
              {vendorTask.notes && <F l="Notes" full v={vendorTask.notes}/>}
            </CardContent>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}

/* ---------- helpers ---------- */
function F({ l, v, full=false }:{ l:string; v:React.ReactNode; full?:boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <p className="text-muted-foreground">{l}</p>
      <p className="font-medium break-words">{v ?? '—'}</p>
    </div>
  );
}

function YN({ v }: { v: 'Yes' | 'No' | string | null }) {
  return v
    ? <Badge variant={v === 'Yes' ? 'default' : 'secondary'}>{v}</Badge>
    : '—';
}

function Status({ b }:{ b:string|null }) {
  if (!b) return '—';
  const t = b.toLowerCase();
  const variant =
    t.includes('accept')||t==='paid' ? 'default'
    : t.includes('pending')||t==='paid partly' ? 'secondary'
    : t.includes('rejected')||t==='expired' ? 'destructive'
    : 'outline';
  return <Badge variant={variant}>{b}</Badge>;
}
