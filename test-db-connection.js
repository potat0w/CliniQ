const supabase = require('./config/db');

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection by checking if we can access the service
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    // Try to get server info
    const { data: version, error: versionError } = await supabase.rpc('version');
    
    if (!versionError) {
      console.log('✅ Database connected successfully!');
      console.log('📊 Database version:', version);
    } else {
      console.log('✅ Database connected successfully!');
      console.log('📊 Connection established (version check not available)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Alternative test - try to access a simple table
async function testWithSimpleQuery() {
  try {
    console.log('🔍 Testing with simple query...');
    
    // This will fail if table doesn't exist, but that's expected
    const { data, error } = await supabase
      .from('doctors')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Database connected! (Tables not created yet - this is normal)');
      console.log('📝 You need to create the database tables first.');
      return true;
    }
    
    if (error) {
      console.error('❌ Query failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connected and tables exist!');
    console.log('📊 Patients count:', data?.[0]?.count || 0);
    return true;
    
  } catch (error) {
    console.error('❌ Query test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database connection test...\n');
  
  const connectionTest = await testConnection();
  
  if (connectionTest) {
    await testWithSimpleQuery();
  }
  
  console.log('\n🏁 Test completed');
  process.exit(0);
}

main();
