import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Material, InventoryTransaction } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Package,
  Plus,
  Search,
  MinusCircle,
  PlusCircle,
  AlertTriangle,
  History,
  Box,
  IndianRupee,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MaterialsPage: React.FC = () => {
  const { currentProject, triggerRefresh } = useProject();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals for Transactions
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'RECEIVED' | 'CONSUMED'>('CONSUMED');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [newMaterial, setNewMaterial] = useState({
    code: '',
    name: '',
    category: 'CEMENT',
    unit: 'Bags',
    availableQuantity: 500,
    reservedQuantity: 0,
    reorderThreshold: 200,
    unitPrice: 380,
    supplier: 'UltraTech Cement Corp',
    storageZone: 'Bay-North Yard',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mList, txList] = await Promise.all([
          api.getMaterials(currentProject?.id || 1),
          api.getInventoryTransactions(currentProject?.id || 1),
        ]);
        if (mList) setMaterials(mList);
        if (txList) setTransactions(txList);
      } catch (err) {
        console.warn('Fallback loading materials:', err);
      }
    };
    fetchData();
  }, [currentProject?.id]);

  const handleOpenTransaction = (mat: Material, type: 'RECEIVED' | 'CONSUMED') => {
    setSelectedMaterial(mat);
    setTransactionType(type);
    setQuantity(type === 'CONSUMED' ? 10 : 50);
    setNotes(type === 'CONSUMED' ? 'Batch pour for Level 7 column rebar' : 'Inbound trailer delivery po-441');
    setErrorMessage('');
    setIsStockModalOpen(true);
  };

  const handleExecuteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    // Strict validation: cannot consume more than unreserved available quantity!
    const unreserved = selectedMaterial.availableQuantity - selectedMaterial.reservedQuantity;
    if (transactionType === 'CONSUMED' && quantity > unreserved) {
      setErrorMessage(
        `Cannot consume ${quantity} ${selectedMaterial.unit}. Only ${unreserved} ${selectedMaterial.unit} unreserved in stock!`
      );
      return;
    }

    try {
      const tx = await api.createInventoryTransaction({
        materialId: selectedMaterial.id,
        projectId: currentProject?.id || 1,
        transactionType,
        quantity,
        referenceDocument: 'NIRMAN-STOCK-TX',
        notes,
      });

      // Update material stock in local state
      const delta = transactionType === 'RECEIVED' ? quantity : -quantity;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === selectedMaterial.id
            ? { ...m, availableQuantity: m.availableQuantity + delta }
            : m
        )
      );
      setTransactions((prev) => [tx, ...prev]);
      setIsStockModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      console.error(err);
      // Local transaction fallback
      const delta = transactionType === 'RECEIVED' ? quantity : -quantity;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === selectedMaterial.id
            ? { ...m, availableQuantity: m.availableQuantity + delta }
            : m
        )
      );
      setIsStockModalOpen(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createMaterial({
        ...newMaterial,
        projectId: currentProject?.id || 1,
      });
      setMaterials((prev) => [...prev, created]);
      setIsAddMaterialModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      const fallback: Material = {
        id: Date.now(),
        ...newMaterial,
        projectId: currentProject?.id || 1,
      };
      setMaterials((prev) => [...prev, fallback]);
      setIsAddMaterialModalOpen(false);
    }
  };

  const filtered = materials.filter((m) => {
    const codeText = m.code || m.materialCode || '';
    const zoneText = m.storageZone || m.storageZoneName || '';
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      codeText.toLowerCase().includes(search.toLowerCase()) ||
      zoneText.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalInventoryValuation = materials.reduce(
    (acc, m) => acc + m.availableQuantity * m.unitPrice,
    0
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-500" />
            Materials Stock & Supply Chain Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rebar, cement, aggregates, consumption governance, anti-loss audit trails, and reorder alerts.
          </p>
        </div>

        <button onClick={() => setIsAddMaterialModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Material SKU
        </button>
      </div>

      {/* Stock Health & Valuation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Stock Valuation</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{(totalInventoryValuation / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Current site inventory</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Tracked SKU Commodities</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">{materials.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fully mapped to 3D site bays</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Low Stock Hazards</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {materials.filter((m) => m.availableQuantity < m.reorderThreshold).length}
          </div>
          <div className="text-[11px] text-amber-300 mt-1">Below safety replenishment buffer</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Stock Transactions</div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">{transactions.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Immutable ledger entries</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by material code, name, or storage bay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="select-field sm:w-48"
        >
          <option value="ALL">All Commodities</option>
          <option value="STEEL">TMT Steel & Rebar</option>
          <option value="CEMENT">Portland Cement</option>
          <option value="CONCRETE">Ready-Mix Concrete</option>
          <option value="AGGREGATE">Aggregates & Sand</option>
          <option value="ELECTRICAL">Electrical Supplies</option>
        </select>
      </div>

      {/* Materials Inventory Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Code & Material</th>
                <th className="p-3.5">Storage Bay</th>
                <th className="p-3.5">Unit Price (₹)</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Reserved</th>
                <th className="p-3.5">Reorder Point</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Log Stock Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((mat) => {
                const isLow = mat.availableQuantity < mat.reorderThreshold;
                return (
                  <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-emerald-400">{mat.code}</div>
                      <div className="font-semibold text-white mt-0.5">{mat.name}</div>
                      <div className="text-[10px] text-slate-400">{mat.supplier}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-blue-400" />
                        <span>{mat.storageZone}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 font-bold">
                      ₹{mat.unitPrice}/{mat.unit}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isLow ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {mat.availableQuantity} {mat.unit}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {mat.reservedQuantity} {mat.unit}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {mat.reorderThreshold} {mat.unit}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={isLow ? 'danger' : 'success'}>
                        {isLow ? '⚠️ LOW STOCK' : 'HEALTHY'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenTransaction(mat, 'CONSUMED')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5 text-red-400" /> Consume
                        </button>
                        <button
                          onClick={() => handleOpenTransaction(mat, 'RECEIVED')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transaction Audit Ledger Feed */}
      <div className="panel-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Immutable Stock Movement Audit Trail</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{transactions.length} recorded operations</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-md border ${
                    tx.transactionType === 'RECEIVED'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-red-950/60 border-red-800 text-red-400'
                  }`}
                >
                  {tx.transactionType === 'RECEIVED' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">
                    {tx.materialName} — {tx.transactionType === 'RECEIVED' ? '+' : '-'}
                    {tx.quantity} {tx.unit}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tx.notes}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-slate-400 text-[10px]">{tx.timestamp}</div>
                <div className="font-mono text-[10px] text-slate-500">By {tx.performedBy || 'Site Storekeeper'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Consume or Receive Stock */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={
          transactionType === 'CONSUMED'
            ? `Log Consumption: ${selectedMaterial?.name}`
            : `Receive Inbound Stock: ${selectedMaterial?.name}`
        }
        maxWidth="md"
      >
        <form onSubmit={handleExecuteTransaction} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between">
            <span className="text-slate-400">Available Unreserved Stock:</span>
            <span className="font-mono font-bold text-emerald-400">
              {selectedMaterial
                ? selectedMaterial.availableQuantity - selectedMaterial.reservedQuantity
                : 0}{' '}
              {selectedMaterial?.unit}
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Quantity to {transactionType === 'CONSUMED' ? 'Deduct' : 'Add'} ({selectedMaterial?.unit}) *
            </label>
            <input
              required
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Work Package / Consumption Justification *
            </label>
            <textarea
              required
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={transactionType === 'CONSUMED' ? 'btn-outline-danger' : 'btn-primary'}
            >
              Confirm {transactionType}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Material SKU */}
      <Modal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        title="Add Material Inventory SKU"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Commodity Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. MAT-AGG-04"
                value={newMaterial.code}
                onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                className="input-field uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Material Description *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 20mm Crushed Blue Granite"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Unit
              </label>
              <input
                type="text"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                value={newMaterial.availableQuantity}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, availableQuantity: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Unit Price (₹)
              </label>
              <input
                type="number"
                value={newMaterial.unitPrice}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, unitPrice: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                value={newMaterial.reorderThreshold}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, reorderThreshold: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Storage Yard Bay
              </label>
              <input
                type="text"
                value={newMaterial.storageZone}
                onChange={(e) => setNewMaterial({ ...newMaterial, storageZone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMaterialModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Register Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
