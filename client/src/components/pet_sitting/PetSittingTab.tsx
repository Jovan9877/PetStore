import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IPetSittingAPI } from "../../api/pet_sitting/IPetSittingAPI";
import { getErrorMessage } from "../../helpers/error_message";
import { useAuth } from "../../hooks/useAuthHook";
import { CreatePetSittingDTO, PetSittingReceiptDTO, PetSittingStayDTO } from "../../models/pet_sitting/PetSittingModels";

const initialForm: CreatePetSittingDTO = { petName: "", petType: "DOG", birthYear: new Date().getFullYear() - 2, ownerName: "", ownerPhone: "", plannedHours: 1 };
const cell = { padding: 8, textAlign: "left" as const };

export function PetSittingTab({ api }: { api: IPetSittingAPI }) {
  const { token, user, simulationDateTime } = useAuth();
  const [stays, setStays] = useState<PetSittingStayDTO[]>([]);
  const [receipts, setReceipts] = useState<PetSittingReceiptDTO[]>([]);
  const [form, setForm] = useState<CreatePetSittingDTO>(initialForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSeller = user?.role === "SELLER";
  const isManager = user?.role === "MANAGER";

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const loadedStays = await api.getStays(token);
      setStays(loadedStays);
      if (isManager) setReceipts(await api.getReceipts(token));
      setError("");
    } catch (problem: unknown) { setError(getErrorMessage(problem, "Failed to load pet sitting data.")); }
    finally { setLoading(false); }
  }, [api, isManager, token]);

  useEffect(() => { void load(); }, [load]);
  const matches = useCallback((stay: PetSittingStayDTO) => !query.trim() || Object.values(stay).some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase())), [query]);
  const active = useMemo(() => stays.filter((stay) => stay.status === "ACTIVE" && matches(stay)).sort((a, b) => a.arrivalAt.localeCompare(b.arrivalAt)), [matches, stays]);
  const history = useMemo(() => stays.filter((stay) => stay.status === "COMPLETED" && matches(stay)).sort((a, b) => (b.departureAt ?? "").localeCompare(a.departureAt ?? "")), [matches, stays]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!token) return; setSaving(true); setError(""); setMessage("");
    try { await api.checkIn(form, token); setForm(initialForm); setMessage("Pet checked in successfully."); await load(); }
    catch (problem: unknown) { setError(getErrorMessage(problem, "Check-in failed.")); }
    finally { setSaving(false); }
  };
  const checkout = async (id: number) => {
    if (!token) return; setError(""); setMessage("");
    try { const result = await api.checkOut(id, token); setMessage(`Checkout completed. Receipt total: ${result.receipt.totalAmount} RSD.`); await load(); }
    catch (problem: unknown) { setError(getErrorMessage(problem, "Checkout failed.")); }
  };

  if (loading) return <div className="card" style={{ padding: 32 }}>Loading pet sitting data...</div>;
  return <>
    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}><div><h1>Pet Sitting</h1><p>Check in pets, track their stay and complete checkout in one place.</p></div></div>
    {message && <div className="card" style={{ padding: 12, marginBottom: 12 }}>{message}</div>}
    {error && <div className="card" style={{ padding: 12, marginBottom: 12, borderColor: "var(--win11-close-hover)" }}>{error}</div>}
    {isSeller && <form className="card" style={{ padding: 16, marginBottom: 16 }} onSubmit={submit}>
      <h3 style={{ marginBottom: 12 }}>New Check-in</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <label className="form-field"><span className="field-label">Pet name</span><input placeholder="Enter pet name" autoComplete="off" value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} required /></label>
        <label className="form-field"><span className="field-label">Pet type</span><select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value as CreatePetSittingDTO["petType"] })}>{["DOG", "CAT", "BIRD", "RODENT", "REPTILE", "OTHER"].map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="form-field"><span className="field-label">Birth year</span><input type="number" min={1980} max={new Date(simulationDateTime ?? Date.now()).getFullYear()} value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: Number(e.target.value) })} required /></label>
        <label className="form-field"><span className="field-label">Owner name</span><input placeholder="Enter owner name" autoComplete="name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required /></label>
        <label className="form-field"><span className="field-label">Owner phone</span><input type="tel" placeholder="Enter owner phone" autoComplete="tel" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} required /></label>
        <label className="form-field"><span className="field-label">Planned stay (hours)</span><input type="number" min={1} max={720} value={form.plannedHours} onChange={(e) => setForm({ ...form, plannedHours: Number(e.target.value) })} required /></label>
      </div><button className="btn btn-accent" style={{ marginTop: 12 }} disabled={saving}>{saving ? "Saving..." : "Check In"}</button>
    </form>}
    <div className="card" style={{ padding: 16, marginBottom: 16 }}><input type="search" placeholder="Search any pet sitting field..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
    <StayTable title={`Currently here (${active.length})`} stays={active} canCheckout={isSeller} onCheckout={checkout} />
    <StayTable title={`History (${history.length})`} stays={history} canCheckout={false} onCheckout={checkout} />
    {isManager && <div className="card" style={{ padding: 16 }}><h3>Pet Sitting Receipts</h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={cell}>ID</th><th style={cell}>Stay</th><th style={cell}>Seller</th><th style={cell}>Hours</th><th style={cell}>Rate</th><th style={cell}>Total</th><th style={cell}>Issued</th></tr></thead><tbody>{receipts.map((receipt) => <tr key={receipt.id}><td style={cell}>{receipt.id}</td><td style={cell}>{receipt.stayId}</td><td style={cell}>{receipt.sellerName}</td><td style={cell}>{receipt.billableHours}</td><td style={cell}>{receipt.hourlyRate}</td><td style={cell}>{receipt.totalAmount} RSD</td><td style={cell}>{new Date(receipt.issuedAt).toLocaleString()}</td></tr>)}</tbody></table></div></div>}
  </>;
}

function StayTable({ title, stays, canCheckout, onCheckout }: { title: string; stays: PetSittingStayDTO[]; canCheckout: boolean; onCheckout: (id: number) => void }) {
  return <div className="card" style={{ padding: 16, marginBottom: 16 }}><h3>{title}</h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={cell}>Pet</th><th style={cell}>Type/Year</th><th style={cell}>Owner</th><th style={cell}>Arrival</th><th style={cell}>Planned</th><th style={cell}>Departure / Total</th>{canCheckout && <th style={cell}>Action</th>}</tr></thead><tbody>{stays.map((stay) => <tr key={stay.id}><td style={cell}>{stay.petName}</td><td style={cell}>{stay.petType}, {stay.birthYear}</td><td style={cell}>{stay.ownerName}<br />{stay.ownerPhone}</td><td style={cell}>{new Date(stay.arrivalAt).toLocaleString()}</td><td style={cell}>{stay.plannedHours} h</td><td style={cell}>{stay.departureAt ? new Date(stay.departureAt).toLocaleString() : "-"}{stay.totalAmount !== undefined && <><br />{stay.totalAmount} RSD</>}</td>{canCheckout && <td style={cell}><button className="btn btn-accent" onClick={() => onCheckout(stay.id)}>Check Out</button></td>}</tr>)}</tbody></table>{stays.length === 0 && <p>No records.</p>}</div></div>;
}
