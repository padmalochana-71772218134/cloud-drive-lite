// ✅ Supabase credentials
const supabaseUrl = 'https://ywksgpkusjllpkchruhq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3a3NncGt1c2psbHBrY2hydWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Mjc3NjcsImV4cCI6MjA2OTUwMzc2N30.cgjtvlx_4cQrTZywYKLtxpC8GYnYzeHKVkuO5EE75bU'; // truncated for safety
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 🔐 Sign up
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert('Check your email for confirmation');
}

// 🔓 Sign in
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  } else {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('user-email').textContent = email;
    listFiles(); // Auto-load file list
  }
}

// 📤 Upload file
async function uploadFile() {
  const file = document.getElementById('fileInput').files[0];
  const { data: { user } } = await supabase.auth.getUser();

  const path = `${user.id}/${file.name}`;
  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(path, file, { upsert: true });

  if (error) alert(error.message);
  else {
    alert('File uploaded successfully!');
    listFiles(); // Refresh list
  }
}

// 📃 List + Open + Delete files
async function listFiles() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .list(`${user.id}/`);

  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  if (error) {
    alert(error.message);
    return;
  }

  data.forEach(async (file) => {
    const li = document.createElement('li');
    li.textContent = file.name;

    // Open Button
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    openBtn.onclick = async () => {
      const { data: urlData } = await supabase.storage
        .from('user-uploads')
        .createSignedUrl(`${user.id}/${file.name}`, 60);
      if (urlData?.signedUrl) window.open(urlData.signedUrl, '_blank');
    };

    // Delete Button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = async () => {
      const { error: delError } = await supabase.storage
        .from('user-uploads')
        .remove([`${user.id}/${file.name}`]);
      if (delError) alert(delError.message);
      else {
        alert('File deleted');
        listFiles(); // Refresh
      }
    };

    li.appendChild(openBtn);
    li.appendChild(delBtn);
    fileList.appendChild(li);
  });
}
