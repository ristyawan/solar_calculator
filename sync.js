// Sinkronisasi Supabase: login pemilik, produk -> tabel products, pengaturan/proyek/penawaran -> app_settings.
(async () => {
  const cfg = window.MSC_CONFIG || {};
  if (!window.supabase || !cfg.url || cfg.url.includes('YOUR-')) { view('dash'); return; } // mode lokal
  const sb = supabase.createClient(cfg.url, cfg.anonKey);
  $('#nav').innerHTML = '';
  let { data: { session } } = await sb.auth.getSession();
  if (!session) session = await new Promise(res => {
    $('#m').innerHTML = `<div class="card" style="max-width:380px;margin:40px auto"><h3>Masuk</h3><label>Email</label><input id="le" type="email"><label style="margin-top:8px">Password</label><input id="lp" type="password"><p id="lx" style="color:#dc2626"></p><button class="b" id="lb">Masuk</button></div>`;
    $('#lb').onclick = async () => {
      const { data, error } = await sb.auth.signInWithPassword({ email: $('#le').value, password: $('#lp').value });
      error ? $('#lx').textContent = error.message : res(data.session);
    };
  });
  const uid = session.user.id;
  const fromRow = r => ({ sku: r.sku, name: r.name, cat: r.category, spec: r.spec, desc: r.description, img: r.image_path, b2b: r.price_b2b, b2c: r.price_b2c, cost: r.cost_price, custom: r.custom_price, av: r.availability, active: r.active });
  const toRow = p => ({ owner_id: uid, sku: p.sku, name: p.name, category: p.cat || 'Lainnya', spec: p.spec || null, description: p.desc || null, image_path: p.img || null, price_b2b: p.b2b, price_b2c: p.b2c, cost_price: p.cost, custom_price: p.custom, availability: p.av || 'Tersedia', active: p.active !== false });
  const [pr, st] = await Promise.all([sb.from('products').select('*').order('id'), sb.from('app_settings').select('settings').maybeSingle()]);
  if (pr.data && pr.data.length) S.products = pr.data.map(fromRow);
  const x = st.data && st.data.settings;
  if (x && x.set) { S.set = { ...S.set, ...x.set }; S.projects = x.projects || []; S.qs = x.qs || []; S.ph = x.ph || []; S.cats = x.cats || []; S.seq = x.seq || 0; }
  let t, busy = false;
  const push = async () => {
    if (busy) return schedule(); busy = true;
    try {
      const a = await sb.from('products').upsert(S.products.map(toRow), { onConflict: 'owner_id,sku' }); if (a.error) throw a.error;
      const keep = new Set(S.products.map(p => p.sku)), all = await sb.from('products').select('sku');
      const del = (all.data || []).map(r => r.sku).filter(k => !keep.has(k));
      if (del.length) await sb.from('products').delete().in('sku', del);
      const b = await sb.from('app_settings').upsert({ owner_id: uid, settings: { set: S.set, projects: S.projects, qs: S.qs, ph: S.ph, cats: S.cats, seq: S.seq } }); if (b.error) throw b.error;
    } catch (e) { toast('Gagal sinkron: ' + (e.message || e)); }
    busy = false;
  };
  const schedule = () => { clearTimeout(t); t = setTimeout(push, 800); };
  const local = save; save = () => { local(); schedule(); };
  const out = document.createElement('button'); out.className = 's'; out.textContent = 'Keluar';
  out.onclick = async () => { await sb.auth.signOut(); location.reload(); };
  document.querySelector('header').append(out);
  view('dash');
})();
