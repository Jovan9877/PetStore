import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IShelterAPI } from "../../api/shelters/IShelterAPI";
import { getErrorMessage } from "../../helpers/error_message";
import { useAuth } from "../../hooks/useAuthHook";
import { ShelterDataDTO, ShelterPetDTO } from "../../models/shelters/ShelterModels";

const emptyData: ShelterDataDTO = { shelters: [], pets: [], reservations: [] };
const cell = { padding: 8, textAlign: "left" as const };

export function SheltersTab({ api }: { api: IShelterAPI }) {
  const { token } = useAuth();
  const [data, setData] = useState<ShelterDataDTO>(emptyData);
  const [query, setQuery] = useState("");
  const [shelterId, setShelterId] = useState<number | "all">("all");
  const [selected, setSelected] = useState<ShelterPetDTO | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (quiet = false) => {
    if (!token) return;
    try { setData(await api.getData(token)); if (!quiet) setError(""); }
    catch (problem: unknown) { if (!quiet) setError(getErrorMessage(problem, "Failed to load shelter data.")); }
    finally { setLoading(false); }
  }, [api, token]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 3000);
    return () => window.clearInterval(interval);
  }, [load]);

  const pets = useMemo(() => data.pets.filter((pet) => {
    const shelter = data.shelters.find((item) => item.id === pet.shelterId);
    const matchesShelter = shelterId === "all" || pet.shelterId === shelterId;
    const text = `${pet.name} ${pet.breed} ${pet.type} ${pet.birthYear} ${shelter?.name ?? ""}`.toLowerCase();
    return matchesShelter && text.includes(query.trim().toLowerCase());
  }).sort((a, b) => a.name.localeCompare(b.name)), [data.pets, data.shelters, query, shelterId]);

  const reserve = async (event: FormEvent) => {
    event.preventDefault(); if (!token || !selected) return; setError(""); setMessage("");
    try { const reservation = await api.reserve(selected.id, { customerName, customerPhone }, token); setMessage(`Reserved until ${new Date(reservation.expiresAt).toLocaleString()}.`); setSelected(null); setCustomerName(""); setCustomerPhone(""); await load(); }
    catch (problem: unknown) { setError(getErrorMessage(problem, "Reservation failed.")); }
  };

  if (loading) return <div className="card" style={{ padding: 32 }}>Loading shelters...</div>;
  return <>
    <div style={{ marginBottom: 16 }}><h1>Local Pet Shelters</h1><p>Browse pets from nearby shelters and reserve one for a customer.</p></div>
    {message && <div className="card" style={{ padding: 12, marginBottom: 12 }}>{message}</div>}
    {error && <div className="card" style={{ padding: 12, marginBottom: 12, borderColor: "var(--win11-close-hover)" }}>{error}</div>}
    <div className="card" style={{ padding: 16, marginBottom: 16 }}><div className="flex gap-2"><input type="search" placeholder="Search name, breed, type, year or shelter..." value={query} onChange={(e) => setQuery(e.target.value)} /><select value={shelterId} onChange={(e) => setShelterId(e.target.value === "all" ? "all" : Number(e.target.value))}><option value="all">All shelters</option>{data.shelters.map((shelter) => <option key={shelter.id} value={shelter.id}>{shelter.name} - {shelter.city}</option>)}</select></div></div>
    <div className="card" style={{ padding: 16, marginBottom: 16 }}><h3>Pets for Adoption ({pets.length})</h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={cell}>Name</th><th style={cell}>Type</th><th style={cell}>Breed</th><th style={cell}>Birth year</th><th style={cell}>Shelter</th><th style={cell}>Status</th><th style={cell}>Action</th></tr></thead><tbody>{pets.map((pet) => { const shelter = data.shelters.find((item) => item.id === pet.shelterId); return <tr key={pet.id}><td style={cell}>{pet.name}</td><td style={cell}>{pet.type}</td><td style={cell}>{pet.breed}</td><td style={cell}>{pet.birthYear}</td><td style={cell}>{shelter?.name}<br />{shelter?.city}</td><td style={cell}>{pet.status === "AVAILABLE" ? "Available" : "Reserved"}</td><td style={cell}>{pet.status === "AVAILABLE" ? <button className="btn btn-accent" onClick={() => setSelected(pet)}>Reserve</button> : "Reserved"}</td></tr>; })}</tbody></table>{pets.length === 0 && <p>No pets match the current filters.</p>}</div></div>
    <div className="card" style={{ padding: 16 }}><h3>Reservation History</h3><div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th style={cell}>Pet ID</th><th style={cell}>Customer</th><th style={cell}>Reserved by</th><th style={cell}>Expires</th><th style={cell}>Status</th></tr></thead><tbody>{[...data.reservations].reverse().map((reservation) => <tr key={reservation.id}><td style={cell}>{reservation.petId}</td><td style={cell}>{reservation.customerName}<br />{reservation.customerPhone}</td><td style={cell}>{reservation.reservedBy}</td><td style={cell}>{new Date(reservation.expiresAt).toLocaleString()}</td><td style={cell}>{reservation.status}</td></tr>)}</tbody></table></div></div>
    {selected && <div className="overlay"><div className="window" style={{ width: 480, maxWidth: "95%" }}><div className="titlebar"><span className="titlebar-title">Reserve {selected.name}</span></div><div className="window-content"><form className="flex flex-col gap-3" onSubmit={reserve}><label className="form-field"><span className="field-label">Customer name</span><input placeholder="Enter customer name" autoComplete="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required /></label><label className="form-field"><span className="field-label">Customer phone</span><input type="tel" placeholder="Enter customer phone" autoComplete="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required /></label><div className="flex gap-2"><button type="button" className="btn btn-standard" onClick={() => setSelected(null)}>Cancel</button><button className="btn btn-accent">Reserve for 24 hours</button></div></form></div></div></div>}
  </>;
}
