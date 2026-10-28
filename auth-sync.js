/* Healthy Weight v2.1 — email authentication and explicit cloud snapshot sync.
 * Never put a service_role or secret key in config.js / browser code.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const bridge = window.HealthyWeightBridge;
  const conf = window.HEALTHY_WEIGHT_SUPABASE || {};
  const url = String(conf.url || '').trim();
  const publicKey = String(conf.publishableKey || '').trim();
  let client = null;
  let currentUser = null;
  let currentUserId = null;
  let working = false;

  const status = (message, type = '') => {
    $('authMessage').textContent = message;
    $('authMessage').className = 'account-status' + (type ? ' ' + type : '');
  };
  const cloud = message => { $('cloudStatus').textContent = message; };
  const view = () => {
    const logged = !!currentUser;
    $('loggedOutPanel').hidden = logged;
    $('loggedInPanel').hidden = !logged;
    $('loggedEmail').textContent = logged ? currentUser.email || '(email chưa xác minh)' : '';
    $('cloudUpload').disabled = !logged || working;
    $('cloudDownload').disabled = !logged || working;
    $('copyGuest').disabled = !logged || working || !bridge.readGuest();
    $('accountAvatar').textContent = logged ? (currentUser.email || 'U').slice(0, 1).toUpperCase() : 'HW';
    $('accountConfigInfo').textContent = client
      ? 'Đồng bộ thủ công: bấm Lưu lên đám mây trên thiết bị nguồn, rồi Lấy từ đám mây trên thiết bị còn lại.'
      : 'Chưa kết nối Supabase. Chủ website cần điền Project URL + Publishable key vào config.js và chạy supabase-setup.sql.';
  };
  const setBusy = value => { working = value; view(); };
  const count = s => `${s.weights.length} số đo, ${s.foods.length} món ăn`;
  const savedCopy = (d, suffix = 'backup') => {
    const blob = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `healthy-weight-${suffix}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  };
  const requireInput = () => {
    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Vui lòng nhập email hợp lệ.');
    if (password.length < 8) throw new Error('Mật khẩu phải có ít nhất 8 ký tự.');
    return {email, password};
  };
  const withBusy = async task => {
    if (working) return;
    setBusy(true);
    try { await task(); }
    catch (error) { status('Không thực hiện được: ' + (error?.message || 'Vui lòng thử lại.'), 'error'); }
    finally { setBusy(false); }
  };
  const setUser = user => {
    if (user && user.id !== currentUserId) {
      bridge.activate(user.id);
      currentUserId = user.id;
      cloud('Đã đăng nhập. Nhấn Lấy từ đám mây nếu trước đó đã lưu dữ liệu ở thiết bị khác.');
    } else if (!user && currentUserId) {
      currentUserId = null;
      bridge.deactivate();
      cloud('Đã đăng xuất. Dữ liệu của tài khoản không hiển thị ở chế độ khách.');
    }
    currentUser = user || null;
    if (user) status('Đã đăng nhập: ' + (user.email || 'tài khoản của bạn') + '. Đồng bộ đám mây chỉ khi bạn bấm nút.', '');
    else status(client ? 'Đang dùng chế độ khách. Bạn có thể đăng ký hoặc đăng nhập.' : 'Chưa cấu hình Supabase; ứng dụng vẫn dùng được ở chế độ khách.', 'warn');
    view();
  };

  $('signUpBtn').addEventListener('click', () => withBusy(async () => {
    if (!client) throw new Error('Chưa cấu hình Supabase.');
    const {email, password} = requireInput();
    const {error} = await client.auth.signUp({email, password, options:{emailRedirectTo: location.origin + location.pathname}});
    if (error) throw error;
    status('Đã gửi yêu cầu đăng ký. Nếu cần xác minh, hãy mở email xác nhận trước khi đăng nhập.');
    $('authPassword').value = '';
  }));
  $('signInBtn').addEventListener('click', () => withBusy(async () => {
    if (!client) throw new Error('Chưa cấu hình Supabase.');
    const {email, password} = requireInput();
    const {error} = await client.auth.signInWithPassword({email,password});
    if (error) throw error;
    $('authPassword').value = '';
  }));
  $('resetBtn').addEventListener('click', () => withBusy(async () => {
    if (!client) throw new Error('Chưa cấu hình Supabase.');
    const email = $('authEmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Nhập email trước khi nhấn Quên mật khẩu.');
    const {error} = await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
    if (error) throw error;
    status('Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư.');
  }));
  $('changePasswordBtn').addEventListener('click', () => withBusy(async () => {
    if (!client || !currentUser) throw new Error('Bạn cần đăng nhập bằng liên kết khôi phục mật khẩu.');
    const password = $('newPassword').value;
    if (password.length < 8) throw new Error('Mật khẩu mới cần ít nhất 8 ký tự.');
    const {error} = await client.auth.updateUser({password});
    if (error) throw error;
    $('newPassword').value='';$('passwordRecovery').hidden = true;
    status('Đã cập nhật mật khẩu.');
  }));
  $('signOutBtn').addEventListener('click', () => withBusy(async () => {
    if (!client) throw new Error('Không có kết nối xác thực.');
    const {error} = await client.auth.signOut();
    if (error) throw error;
    setUser(null);
  }));
  $('cloudUpload').addEventListener('click', () => withBusy(async () => {
    if (!client || !currentUser) throw new Error('Bạn cần đăng nhập.');
    if (bridge.isDemo()) throw new Error('Chế độ dữ liệu mẫu không thể đồng bộ.');
    const userId = currentUser.id;
    const snapshot = bridge.getData();
    if (!bridge.validate(snapshot)) throw new Error('Dữ liệu hiện tại không hợp lệ.');
    const bytes = new Blob([JSON.stringify(snapshot)]).size;
    if (bytes > 700000) throw new Error('Dữ liệu lớn, hãy xuất JSON trước. Phiên bản này giới hạn khoảng 700 KB mỗi bản đồng bộ.');
    const {data:existing, error:readError} = await client.from('health_snapshots').select('updated_at').eq('user_id',userId).maybeSingle();
    if (readError) throw readError;
    const desc = existing ? `Bản trên đám mây cập nhật: ${new Date(existing.updated_at).toLocaleString('vi-VN')}. Lưu từ thiết bị này sẽ GHI ĐÈ bản đám mây. Tiếp tục?` : `Lưu ${count(snapshot)} lên đám mây của tài khoản này?`;
    if (!window.confirm(desc)) return;
    const {data:result, error} = await client.from('health_snapshots').upsert({user_id:userId,snapshot,updated_at:new Date().toISOString()}, {onConflict:'user_id'}).select('updated_at').single();
    if (error) throw error;
    cloud(`Đã lưu ${count(snapshot)} lên đám mây lúc ${new Date(result.updated_at).toLocaleString('vi-VN')}.`);
    status('Đồng bộ lên đám mây thành công.');
  }));
  $('cloudDownload').addEventListener('click', () => withBusy(async () => {
    if (!client || !currentUser) throw new Error('Bạn cần đăng nhập.');
    if (bridge.isDemo()) throw new Error('Chế độ dữ liệu mẫu không thể đồng bộ.');
    const {data:remote,error} = await client.from('health_snapshots').select('snapshot,updated_at').eq('user_id',currentUser.id).maybeSingle();
    if (error) throw error;
    if (!remote) {cloud('Tài khoản chưa có dữ liệu trên đám mây. Hãy lưu dữ liệu từ iPad trước.');return;}
    if (!bridge.validate(remote.snapshot)) throw new Error('Dữ liệu trên đám mây không đúng định dạng; không thay đổi bản trên thiết bị.');
    const message = `Trên đám mây: ${count(remote.snapshot)} (cập nhật ${new Date(remote.updated_at).toLocaleString('vi-VN')}).\n\nLấy về sẽ THAY THẾ dữ liệu tài khoản đang xem trên thiết bị này. Một tệp sao lưu sẽ được tải xuống trước. Bạn đồng ý?`;
    if (!window.confirm(message))return;
    savedCopy(bridge.getData(),'before-cloud-download');
    if (!bridge.setData(remote.snapshot)) throw new Error('Không thể áp dụng dữ liệu được tải về.');
    cloud(`Đã lấy ${count(remote.snapshot)} từ đám mây về thiết bị.`);
    status('Đã lấy dữ liệu từ đám mây và tạo bản sao lưu trước khi thay thế.');
  }));
  $('copyGuest').addEventListener('click', () => withBusy(async () => {
    if (!currentUser) throw new Error('Bạn cần đăng nhập.');
    const guest = bridge.readGuest();
    if (!guest) throw new Error('Không có dữ liệu khách để chuyển.');
    const own = bridge.getData();
    const ownIsEmpty = own.weights.length === 0 && own.foods.length === 0 && !Object.keys(own.profile).length && !own.notes && !Object.keys(own.water).length && !Object.keys(own.habits).length;
    if (!ownIsEmpty) throw new Error('Tài khoản đã có dữ liệu. Hãy xuất hai bản JSON và chỉ nhập lại sau khi kiểm tra để tránh mất dữ liệu.');
    if (!window.confirm(`Sao chép ${count(guest)} từ chế độ khách vào tài khoản hiện tại? Bản khách vẫn được giữ lại. Việc này CHƯA tự tải lên đám mây.`))return;
    bridge.setData(guest);
    cloud('Đã sao chép nhật ký khách vào tài khoản trên thiết bị này. Nhấn Lưu lên đám mây nếu muốn đồng bộ.');
    status('Đã sao chép dữ liệu khách. Bản gốc vẫn còn trên thiết bị.');
  }));

  async function start(){
    if (!url || !publicKey || !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)) {
      status('Chưa kết nối hệ thống tài khoản. Chủ website cần cấu hình Supabase; chế độ khách vẫn dùng được.', 'warn');
      cloud('Chưa có cấu hình tài khoản.');view();return;
    }
    if (!window.supabase?.createClient) {
      status('Chưa tải được thư viện đăng nhập. Hãy kiểm tra kết nối Internet rồi tải lại.', 'error');view();return;
    }
    try{
      client=window.supabase.createClient(url,publicKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
      client.auth.onAuthStateChange((event,session)=>{
        // Avoid async Supabase API calls directly inside the auth event callback.
        setTimeout(()=>{
          setUser(session?.user || null);
          if (event==='PASSWORD_RECOVERY'){
            $('passwordRecovery').hidden=false;
            bridge.showAccount();
            status('Bạn đã mở liên kết khôi phục. Hãy nhập mật khẩu mới phía dưới.');
          }
        },0);
      });
      const {data:sessionData,error} = await client.auth.getSession();
      if(error)throw error;
      setUser(sessionData.session?.user || null);
    } catch(error){status('Không kết nối được Supabase: '+(error?.message||'Lỗi mạng'), 'error');}
    view();
  }
  view();start();
})();
