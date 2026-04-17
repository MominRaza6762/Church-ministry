import React, { useEffect, useState } from "react";
import LogCard from "../components/LogCard.jsx";
import Modal from "../components/Modal.jsx";
import { useLogStore } from "../store/logStore.js";
import { useAutoSave } from "../hooks/useAutoSave.js";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar.js";
import { startGoogleOAuth, calendarStatusApi } from "../api/calendarApi.js";

const formatEventTime = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

const SmallSpinner = () => (
  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ── Tax & Ministry Expense Tracker ────────────────────────────────────────────
// Phase 2 items (Tax Documents Storage, Yearly Summary Dashboard) are skipped per client note.

const HOUSING_EXPENSE_CATEGORIES = [
  "Rent/Mortgage", "Utilities", "Insurance", "Repairs & Maintenance",
  "Furnishings", "Property Tax", "Other"
];

const MINISTRY_EXPENSE_TYPES = [
  "Books & Resources", "Supplies", "Travel", "Meals",
  "Clothing/Vestments", "Technology", "Other"
];

const CONTINUING_ED_CATEGORIES = [
  "Conference", "Retreat", "Online Course", "Books", "Seminar", "Other"
];

const PAYMENT_METHODS = ["Cash", "Check", "Credit Card", "Debit Card", "Other"];

const inputCls = "border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold focus:outline-none transition-all w-full";

// Generic list section used for each expense category
const ExpenseList = ({ items, onRemove, renderItem }) => (
  <div className="space-y-2 mb-2">
    {items.length === 0 ? (
      <p className="text-texts text-sm py-0.5">No entries yet</p>
    ) : (
      items.map((it, idx) => (
        <div key={idx} className="flex items-start gap-3 bg-parchment border border-parchment-dark/50 rounded-xl px-3 py-2.5">
          <div className="flex-1 min-w-0">{renderItem(it)}</div>
          <button onClick={() => onRemove(idx)} className="w-6 h-6 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))
    )}
  </div>
);

const TaxExpenseTracker = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);

  // 8 sub-sections (phase 2 items skipped: Tax Docs Storage, Yearly Summary)
  const [housing, setHousing] = useState([]);
  const [ministry, setMinistry] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [charitable, setCharitable] = useState([]);
  const [contEd, setContEd] = useState([]);
  const [homeOffice, setHomeOffice] = useState([]);
  const [lodging, setLodging] = useState([]);
  const [clothing, setClothing] = useState([]);

  // Modal open states
  const [openModal, setOpenModal] = useState(null);

  // Forms
  const [housingForm, setHousingForm] = useState({ date: "", category: HOUSING_EXPENSE_CATEGORIES[0], amount: "", paymentMethod: PAYMENT_METHODS[0], notes: "" });
  const [ministryForm, setMinistryForm] = useState({ date: "", expenseType: MINISTRY_EXPENSE_TYPES[0], amount: "", description: "", parishReimbursement: "No" });
  const [mileageForm, setMileageForm] = useState({ date: "", startLocation: "", destination: "", purpose: "", milesDriven: "", parkingTolls: "", totalMileage: "" });
  const [charitableForm, setCharitableForm] = useState({ date: "", organization: "", donationType: "Cash", amountOrValue: "", notes: "" });
  const [contEdForm, setContEdForm] = useState({ date: "", eventOrResource: "", category: CONTINUING_ED_CATEGORIES[0], cost: "", location: "", notes: "" });
  const [homeOfficeForm, setHomeOfficeForm] = useState({ expenseType: "", amount: "", description: "", notes: "" });
  const [lodgingForm, setLodgingForm] = useState({ dateOfStay: "", location: "", hotelName: "", purposeOfTravel: "", notes: "" });
  const [clothingForm, setClothingForm] = useState({ date: "", itemPurchased: "", vendorStore: "", cost: "", paymentMethod: PAYMENT_METHODS[0], notes: "" });

  useEffect(() => {
    const t = log?.taxExpenses || {};
    setHousing(Array.isArray(t.housing) ? t.housing : []);
    setMinistry(Array.isArray(t.ministry) ? t.ministry : []);
    setMileage(Array.isArray(t.mileage) ? t.mileage : []);
    setCharitable(Array.isArray(t.charitable) ? t.charitable : []);
    setContEd(Array.isArray(t.contEd) ? t.contEd : []);
    setHomeOffice(Array.isArray(t.homeOffice) ? t.homeOffice : []);
    setLodging(Array.isArray(t.lodging) ? t.lodging : []);
    setClothing(Array.isArray(t.clothing) ? t.clothing : []);
  }, [log?.taxExpenses]);

  const buildAll = (overrides = {}) => ({
    housing, ministry, mileage, charitable, contEd, homeOffice, lodging, clothing, ...overrides
  });

  const save = (key, val) => {
    const updated = buildAll({ [key]: val });
    updateSectionLocal("taxExpenses", updated);
  };

  useAutoSave(date, "taxExpenses", buildAll());

  const add = (key, form, setList, setForm, resetForm) => {
    const current = { housing, ministry, mileage, charitable, contEd, homeOffice, lodging, clothing }[key];
    const updated = [...current, { ...form }];
    setList(updated);
    save(key, updated);
    setOpenModal(null);
    setForm(resetForm);
  };

  const remove = (key, idx, list, setList) => {
    const updated = list.filter((_, i) => i !== idx);
    setList(updated);
    save(key, updated);
  };

  const Row = ({ label, value }) => value ? (
    <div className="text-xs text-texts"><span className="font-medium">{label}:</span> {value}</div>
  ) : null;

  const SubSection = ({ title, icon, count, onAdd, children }) => (
    <div className="border border-parchment-dark/40 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-3 py-2 bg-parchment/60 border-b border-parchment-dark/30">
        <div className="text-sm font-semibold text-textp">{icon} {title} <span className="text-xs text-texts font-normal">({count})</span></div>
        <button onClick={onAdd} className="px-2.5 py-1 bg-burgundy text-ivory rounded-lg text-xs hover:opacity-90 transition-opacity">+ Add</button>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );

  return (
    <>
      <LogCard title="💼 Tax & Ministry Expense Tracker" subtitle="Track clergy tax-deductible expenses">

        {/* 1. Housing Allowance */}
        <SubSection title="Housing Allowance Tracking" icon="🏠" count={housing.length} onAdd={() => setOpenModal("housing")}>
          <ExpenseList items={housing} onRemove={(i) => remove("housing", i, housing, setHousing)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.category}</div>
              <Row label="Date" value={it.date} /><Row label="Amount" value={it.amount ? `$${it.amount}` : ""} />
              <Row label="Payment" value={it.paymentMethod} /><Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        {/* 2. Ministry Expense Log */}
        <SubSection title="Ministry Expense Log" icon="📝" count={ministry.length} onAdd={() => setOpenModal("ministry")}>
          <ExpenseList items={ministry} onRemove={(i) => remove("ministry", i, ministry, setMinistry)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.expenseType}</div>
              <Row label="Date" value={it.date} /><Row label="Amount" value={it.amount ? `$${it.amount}` : ""} />
              <Row label="Description" value={it.description} /><Row label="Parish Reimbursement" value={it.parishReimbursement} />
            </>)} />
        </SubSection>

        {/* 3. Mileage / Travel Log */}
        <SubSection title="Mileage / Travel Log" icon="🚗" count={mileage.length} onAdd={() => setOpenModal("mileage")}>
          <ExpenseList items={mileage} onRemove={(i) => remove("mileage", i, mileage, setMileage)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.purpose || "Travel"}</div>
              <Row label="Date" value={it.date} /><Row label="From" value={it.startLocation} />
              <Row label="To" value={it.destination} /><Row label="Miles" value={it.milesDriven} />
              <Row label="Parking/Tolls" value={it.parkingTolls} /><Row label="Total Mileage" value={it.totalMileage} />
            </>)} />
        </SubSection>

        {/* 4. Charitable Contributions */}
        <SubSection title="Charitable Contributions" icon="🎁" count={charitable.length} onAdd={() => setOpenModal("charitable")}>
          <ExpenseList items={charitable} onRemove={(i) => remove("charitable", i, charitable, setCharitable)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.organization || "—"}</div>
              <Row label="Date" value={it.date} /><Row label="Type" value={it.donationType} />
              <Row label="Amount/Value" value={it.amountOrValue} /><Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        {/* 5. Continuing Education Expenses */}
        <SubSection title="Continuing Education Expenses" icon="🎓" count={contEd.length} onAdd={() => setOpenModal("contEd")}>
          <ExpenseList items={contEd} onRemove={(i) => remove("contEd", i, contEd, setContEd)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.eventOrResource || "—"}</div>
              <Row label="Date" value={it.date} /><Row label="Category" value={it.category} />
              <Row label="Cost" value={it.cost ? `$${it.cost}` : ""} /><Row label="Location" value={it.location} />
              <Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        {/* 6. Home Office / Study Expenses */}
        <SubSection title="Home Office / Study Expenses" icon="🖥️" count={homeOffice.length} onAdd={() => setOpenModal("homeOffice")}>
          <ExpenseList items={homeOffice} onRemove={(i) => remove("homeOffice", i, homeOffice, setHomeOffice)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.expenseType || "—"}</div>
              <Row label="Amount" value={it.amount ? `$${it.amount}` : ""} />
              <Row label="Description" value={it.description} /><Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        {/* 7. Lodging & Accommodations */}
        <SubSection title="Lodging & Accommodations" icon="🏨" count={lodging.length} onAdd={() => setOpenModal("lodging")}>
          <ExpenseList items={lodging} onRemove={(i) => remove("lodging", i, lodging, setLodging)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.hotelName || "—"}</div>
              <Row label="Date of Stay" value={it.dateOfStay} /><Row label="Location" value={it.location} />
              <Row label="Purpose" value={it.purposeOfTravel} /><Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        {/* 8. Clergy Clothing & Maintenance */}
        <SubSection title="Clergy Clothing & Maintenance" icon="👔" count={clothing.length} onAdd={() => setOpenModal("clothing")}>
          <ExpenseList items={clothing} onRemove={(i) => remove("clothing", i, clothing, setClothing)}
            renderItem={(it) => (<>
              <div className="font-medium text-sm text-textp">{it.itemPurchased || "—"}</div>
              <Row label="Date" value={it.date} /><Row label="Vendor" value={it.vendorStore} />
              <Row label="Cost" value={it.cost ? `$${it.cost}` : ""} /><Row label="Payment" value={it.paymentMethod} />
              <Row label="Notes" value={it.notes} />
            </>)} />
        </SubSection>

        <p className="text-xs text-texts/60 italic mt-1">
          📎 Receipt upload (Phase 2) · 📊 Yearly Summary Dashboard (Phase 2) · 🗂️ Tax Document Storage (Phase 2)
        </p>
      </LogCard>

      {/* ── Modals ── */}
      {/* Housing */}
      <Modal open={openModal === "housing"} onClose={() => setOpenModal(null)} title="Log Housing Allowance Expense"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("housing", housingForm, setHousing, setHousingForm, { date: "", category: HOUSING_EXPENSE_CATEGORIES[0], amount: "", paymentMethod: PAYMENT_METHODS[0], notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={housingForm.date} onChange={e => setHousingForm({ ...housingForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Expense Category</label><select value={housingForm.category} onChange={e => setHousingForm({ ...housingForm, category: e.target.value })} className={inputCls}>{HOUSING_EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Amount ($)</label><input type="number" value={housingForm.amount} onChange={e => setHousingForm({ ...housingForm, amount: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Payment Method</label><select value={housingForm.paymentMethod} onChange={e => setHousingForm({ ...housingForm, paymentMethod: e.target.value })} className={inputCls}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={housingForm.notes} onChange={e => setHousingForm({ ...housingForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>

      {/* Ministry Expense */}
      <Modal open={openModal === "ministry"} onClose={() => setOpenModal(null)} title="Log Ministry Expense"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("ministry", ministryForm, setMinistry, setMinistryForm, { date: "", expenseType: MINISTRY_EXPENSE_TYPES[0], amount: "", description: "", parishReimbursement: "No" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={ministryForm.date} onChange={e => setMinistryForm({ ...ministryForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Expense Type</label><select value={ministryForm.expenseType} onChange={e => setMinistryForm({ ...ministryForm, expenseType: e.target.value })} className={inputCls}>{MINISTRY_EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Amount ($)</label><input type="number" value={ministryForm.amount} onChange={e => setMinistryForm({ ...ministryForm, amount: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Description</label><textarea value={ministryForm.description} onChange={e => setMinistryForm({ ...ministryForm, description: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Parish Reimbursement</label><select value={ministryForm.parishReimbursement} onChange={e => setMinistryForm({ ...ministryForm, parishReimbursement: e.target.value })} className={inputCls}><option>No</option><option>Yes</option><option>Pending</option></select></div>
        </div>
      </Modal>

      {/* Mileage */}
      <Modal open={openModal === "mileage"} onClose={() => setOpenModal(null)} title="Log Mileage / Travel"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("mileage", mileageForm, setMileage, setMileageForm, { date: "", startLocation: "", destination: "", purpose: "", milesDriven: "", parkingTolls: "", totalMileage: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={mileageForm.date} onChange={e => setMileageForm({ ...mileageForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Start Location</label><input value={mileageForm.startLocation} onChange={e => setMileageForm({ ...mileageForm, startLocation: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Destination</label><input value={mileageForm.destination} onChange={e => setMileageForm({ ...mileageForm, destination: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Purpose of Travel</label><input value={mileageForm.purpose} onChange={e => setMileageForm({ ...mileageForm, purpose: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Miles Driven</label><input type="number" value={mileageForm.milesDriven} onChange={e => setMileageForm({ ...mileageForm, milesDriven: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Parking / Tolls ($)</label><input type="number" value={mileageForm.parkingTolls} onChange={e => setMileageForm({ ...mileageForm, parkingTolls: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Total Mileage</label><input type="number" value={mileageForm.totalMileage} onChange={e => setMileageForm({ ...mileageForm, totalMileage: e.target.value })} className={inputCls} /></div>
        </div>
      </Modal>

      {/* Charitable */}
      <Modal open={openModal === "charitable"} onClose={() => setOpenModal(null)} title="Log Charitable Contribution"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("charitable", charitableForm, setCharitable, setCharitableForm, { date: "", organization: "", donationType: "Cash", amountOrValue: "", notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={charitableForm.date} onChange={e => setCharitableForm({ ...charitableForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Organization</label><input value={charitableForm.organization} onChange={e => setCharitableForm({ ...charitableForm, organization: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Donation Type</label><select value={charitableForm.donationType} onChange={e => setCharitableForm({ ...charitableForm, donationType: e.target.value })} className={inputCls}><option>Cash</option><option>Items</option><option>Check</option></select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Amount or Estimated Value ($)</label><input value={charitableForm.amountOrValue} onChange={e => setCharitableForm({ ...charitableForm, amountOrValue: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={charitableForm.notes} onChange={e => setCharitableForm({ ...charitableForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>

      {/* Continuing Education */}
      <Modal open={openModal === "contEd"} onClose={() => setOpenModal(null)} title="Log Continuing Education Expense"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("contEd", contEdForm, setContEd, setContEdForm, { date: "", eventOrResource: "", category: CONTINUING_ED_CATEGORIES[0], cost: "", location: "", notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={contEdForm.date} onChange={e => setContEdForm({ ...contEdForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Event or Resource</label><input value={contEdForm.eventOrResource} onChange={e => setContEdForm({ ...contEdForm, eventOrResource: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Category</label><select value={contEdForm.category} onChange={e => setContEdForm({ ...contEdForm, category: e.target.value })} className={inputCls}>{CONTINUING_ED_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Cost ($)</label><input type="number" value={contEdForm.cost} onChange={e => setContEdForm({ ...contEdForm, cost: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Location</label><input value={contEdForm.location} onChange={e => setContEdForm({ ...contEdForm, location: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={contEdForm.notes} onChange={e => setContEdForm({ ...contEdForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>

      {/* Home Office */}
      <Modal open={openModal === "homeOffice"} onClose={() => setOpenModal(null)} title="Log Home Office / Study Expense"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("homeOffice", homeOfficeForm, setHomeOffice, setHomeOfficeForm, { expenseType: "", amount: "", description: "", notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Expense Type</label><input value={homeOfficeForm.expenseType} onChange={e => setHomeOfficeForm({ ...homeOfficeForm, expenseType: e.target.value })} className={inputCls} placeholder="e.g. Desk, Internet, Printer..." /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Amount ($)</label><input type="number" value={homeOfficeForm.amount} onChange={e => setHomeOfficeForm({ ...homeOfficeForm, amount: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Description</label><textarea value={homeOfficeForm.description} onChange={e => setHomeOfficeForm({ ...homeOfficeForm, description: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={homeOfficeForm.notes} onChange={e => setHomeOfficeForm({ ...homeOfficeForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>

      {/* Lodging */}
      <Modal open={openModal === "lodging"} onClose={() => setOpenModal(null)} title="Log Lodging & Accommodations"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("lodging", lodgingForm, setLodging, setLodgingForm, { dateOfStay: "", location: "", hotelName: "", purposeOfTravel: "", notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date of Stay</label><input type="date" value={lodgingForm.dateOfStay} onChange={e => setLodgingForm({ ...lodgingForm, dateOfStay: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Location (City/State)</label><input value={lodgingForm.location} onChange={e => setLodgingForm({ ...lodgingForm, location: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Hotel or Accommodation Name</label><input value={lodgingForm.hotelName} onChange={e => setLodgingForm({ ...lodgingForm, hotelName: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Purpose of Travel</label><input value={lodgingForm.purposeOfTravel} onChange={e => setLodgingForm({ ...lodgingForm, purposeOfTravel: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={lodgingForm.notes} onChange={e => setLodgingForm({ ...lodgingForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>

      {/* Clothing */}
      <Modal open={openModal === "clothing"} onClose={() => setOpenModal(null)} title="Log Clergy Clothing & Maintenance"
        actions={<><button onClick={() => setOpenModal(null)} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark">Cancel</button><button onClick={() => add("clothing", clothingForm, setClothing, setClothingForm, { date: "", itemPurchased: "", vendorStore: "", cost: "", paymentMethod: PAYMENT_METHODS[0], notes: "" })} className="px-4 py-2 bg-gold text-white rounded-xl text-sm hover:opacity-90">Add</button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-texts block mb-1">Date</label><input type="date" value={clothingForm.date} onChange={e => setClothingForm({ ...clothingForm, date: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Item Purchased</label><input value={clothingForm.itemPurchased} onChange={e => setClothingForm({ ...clothingForm, itemPurchased: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Vendor / Store</label><input value={clothingForm.vendorStore} onChange={e => setClothingForm({ ...clothingForm, vendorStore: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Cost ($)</label><input type="number" value={clothingForm.cost} onChange={e => setClothingForm({ ...clothingForm, cost: e.target.value })} className={inputCls} /></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Payment Method</label><select value={clothingForm.paymentMethod} onChange={e => setClothingForm({ ...clothingForm, paymentMethod: e.target.value })} className={inputCls}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className="text-sm font-medium text-texts block mb-1">Notes</label><textarea value={clothingForm.notes} onChange={e => setClothingForm({ ...clothingForm, notes: e.target.value })} className={`${inputCls} min-h-[70px] resize-none`} /></div>
        </div>
      </Modal>
    </>
  );
};

// ── Main AdditionalSections ───────────────────────────────────────────────────
const AdditionalSections = ({ date }) => {
  const log = useLogStore(s => s.log);
  const updateSectionLocal = useLogStore(s => s.updateSectionLocal);
  const [comms, setComms] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [reflections, setReflections] = useState({ observations: "", gratitude: "", intentions: "", signed: false });

  const { events, refresh, loading: calLoading } = useGoogleCalendar();
  const [calConnected, setCalConnected] = useState(false);
  const [checkingCal, setCheckingCal] = useState(true);
  const [connectingCal, setConnectingCal] = useState(false);

  useEffect(() => {
    calendarStatusApi()
      .then(d => setCalConnected(d.connected || false))
      .catch(() => setCalConnected(false))
      .finally(() => setCheckingCal(false));
  }, []);

  useEffect(() => {
    setComms(Array.isArray(log?.communications) ? log.communications : []);
    setFinancials(Array.isArray(log?.financials) ? log.financials : []);
    setReflections(log?.reflections || { observations: "", gratitude: "", intentions: "", signed: false });
  }, [log?.communications, log?.financials, log?.reflections]);

  useAutoSave(date, "communications", comms);
  useAutoSave(date, "financials", financials);
  useAutoSave(date, "reflections", reflections);

  const addComm = () => { const u = [...comms, { time: "", contact: "", subject: "", direction: "In", action: "" }]; setComms(u); updateSectionLocal("communications", u); };
  const updateComm = (i, k, v) => { const a = comms.map((c, idx) => idx === i ? { ...c, [k]: v } : c); setComms(a); updateSectionLocal("communications", a); };
  const removeComm = (i) => { const a = comms.filter((_, idx) => idx !== i); setComms(a); updateSectionLocal("communications", a); };
  const addFinancial = () => { const u = [...financials, { time: "", donor: "", purpose: "", amount: 0, notes: "" }]; setFinancials(u); updateSectionLocal("financials", u); };
  const updateFinancial = (i, k, v) => { const a = financials.map((f, idx) => idx === i ? { ...f, [k]: k === "amount" ? Number(v || 0) : v } : f); setFinancials(a); updateSectionLocal("financials", a); };
  const removeFinancial = (i) => { const a = financials.filter((_, idx) => idx !== i); setFinancials(a); updateSectionLocal("financials", a); };

  const calHeader = (
    <div className="flex items-center gap-2">
      {checkingCal ? (
        <span className="text-xs text-texts flex items-center gap-1"><SmallSpinner />Checking...</span>
      ) : calConnected ? (
        <>
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />Synced
          </span>
          <button onClick={refresh} disabled={calLoading}
            className="px-2.5 py-1 bg-parchment border border-parchment-dark rounded-lg text-xs hover:bg-parchment-dark transition-colors disabled:opacity-50 flex items-center gap-1">
            {calLoading ? <><SmallSpinner />Loading...</> : "Refresh"}
          </button>
        </>
      ) : (
        <button disabled={connectingCal}
          onClick={async () => { setConnectingCal(true); try { await startGoogleOAuth(); } catch (e) { alert(e?.message || "Failed"); setConnectingCal(false); } }}
          className="px-2.5 py-1 bg-burgundy text-ivory rounded-lg text-xs hover:bg-burgundy-dark transition-colors disabled:opacity-60 flex items-center gap-1">
          {connectingCal ? <><SmallSpinner />Connecting...</> : "Connect Google"}
        </button>
      )}
    </div>
  );

  const ic = "border border-parchment-dark rounded-lg px-2 py-1.5 text-xs bg-parchment focus:border-gold focus:bg-white transition-all";

  return (
    <div className="space-y-3">

      {/* Daily Schedule */}
      <LogCard title="Daily Schedule" subtitle="Today's Google Calendar events" right={calHeader}>
        {calLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-texts text-sm"><SmallSpinner />Loading...</div>
        ) : !calConnected ? (
          <div className="py-6 text-center">
            <div className="text-4xl mb-3 animate-float">📅</div>
            <p className="text-texts text-sm">Connect Google Calendar to see today's events.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center">
            <div className="text-4xl mb-3 animate-float">✦</div>
            <p className="text-texts text-sm italic">No events scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <div className="text-[10px] font-semibold text-texts uppercase tracking-widest">Today's Events ({events.length})</div>
            {events.map((ev, idx) => {
              const startTime = formatEventTime(ev.start);
              const endTime = formatEventTime(ev.end);
              return (
                <div key={ev.id || idx} className="flex items-start gap-3 bg-parchment/60 border border-parchment-dark/40 rounded-xl px-4 py-3 hover:border-gold/40 transition-colors">
                  <div className="flex-shrink-0 w-16">
                    <div className="text-xs font-mono font-bold text-burgundy">{startTime}</div>
                    {endTime && endTime !== startTime && <div className="text-[10px] font-mono text-texts/60 mt-0.5">— {endTime}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-textp leading-snug">{ev.summary}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LogCard>

      {/* Telephone & Correspondence */}
      <LogCard title="Telephone & Correspondence Log" subtitle="">
        <div className="space-y-2">
          {comms.length === 0 && <p className="text-texts text-sm py-1">No communications logged today</p>}
          {comms.map((c, i) => (
            <div key={i} className="grid grid-cols-5 gap-1.5 items-center">
              <input placeholder="Time" value={c.time} onChange={(e) => updateComm(i, "time", e.target.value)} className={ic} />
              <input placeholder="Contact" value={c.contact} onChange={(e) => updateComm(i, "contact", e.target.value)} className={ic} />
              <input placeholder="Subject" value={c.subject} onChange={(e) => updateComm(i, "subject", e.target.value)} className={ic} />
              <select value={c.direction} onChange={(e) => updateComm(i, "direction", e.target.value)} className={ic}>
                <option>In</option><option>Out</option>
              </select>
              <div className="flex gap-1">
                <input placeholder="Action" value={c.action} onChange={(e) => updateComm(i, "action", e.target.value)} className={`flex-1 min-w-0 ${ic}`} />
                <button onClick={() => removeComm(i)} className="w-6 h-7 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={addComm} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">+ Log Communication</button>
        </div>
      </LogCard>

      {/* Tax & Ministry Expense Tracker — inserted here between Correspondence and Financial Notes */}
      <TaxExpenseTracker date={date} />

      {/* Financial Notes */}
      <LogCard title="Financial Notes & Charitable Receipts" subtitle="">
        <div className="space-y-2">
          {financials.length === 0 && <p className="text-texts text-sm py-1">No financial entries logged today</p>}
          {financials.map((f, i) => (
            <div key={i} className="grid grid-cols-5 gap-1.5 items-center">
              <input placeholder="Time" value={f.time} onChange={(e) => updateFinancial(i, "time", e.target.value)} className={ic} />
              <input placeholder="Donor/Source" value={f.donor} onChange={(e) => updateFinancial(i, "donor", e.target.value)} className={ic} />
              <input placeholder="Purpose" value={f.purpose} onChange={(e) => updateFinancial(i, "purpose", e.target.value)} className={ic} />
              <input placeholder="Amount" type="number" value={f.amount} onChange={(e) => updateFinancial(i, "amount", e.target.value)} className={ic} />
              <div className="flex gap-1">
                <input placeholder="Notes" value={f.notes} onChange={(e) => updateFinancial(i, "notes", e.target.value)} className={`flex-1 min-w-0 ${ic}`} />
                <button onClick={() => removeFinancial(i)} className="w-6 h-7 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={addFinancial} className="px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">+ Log Financial Entry</button>
        </div>
      </LogCard>

      {/* Pastoral Reflections */}
      <LogCard title="Pastoral Notes, Reflections & Thanksgiving" subtitle="">
        <div className="space-y-3">
          {[
            { key: "observations", label: "Significant observations / Pastoral concerns", placeholder: "Note any pastoral concerns..." },
            { key: "gratitude", label: "Gratitude & Spiritual fruits noticed today", placeholder: "What are you grateful for today?" },
            { key: "intentions", label: "Intentions for tomorrow / Follow-up actions", placeholder: "What needs follow-up tomorrow?" }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-1.5">{label}</div>
              <textarea value={reflections[key]} onChange={(e) => setReflections(r => ({ ...r, [key]: e.target.value }))}
                className="w-full border border-parchment-dark rounded-xl px-3 py-2 text-sm bg-parchment focus:bg-white focus:border-gold transition-all min-h-[80px] resize-none"
                placeholder={placeholder} />
            </div>
          ))}
          <div className="bg-parchment rounded-xl px-4 py-3 border border-parchment-dark/40">
            <div className="text-xs font-semibold text-texts uppercase tracking-wider mb-1">Evening Prayer of Examination</div>
            <p className="text-textp text-sm font-serif italic leading-relaxed">
              O Lord, grant me to see my own sins and not to judge my brother. For blessed art Thou unto the ages of ages. Amen.
            </p>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div onClick={() => setReflections(r => ({ ...r, signed: !r.signed }))}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
                ${reflections.signed ? "bg-burgundy border-burgundy" : "bg-ivory border-parchment-dark"}`}>
              {reflections.signed && (
                <svg className="w-3 h-3 text-ivory" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-textp">Evening examination complete ✓</span>
          </label>
        </div>
      </LogCard>

    </div>
  );
};

export default AdditionalSections;
