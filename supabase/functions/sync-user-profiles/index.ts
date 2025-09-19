import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting user profile sync...')

    // Get all users from auth.users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${users.users.length} users in auth`)

    let syncedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const user of users.users) {
      try {
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error(`Error checking profile for user ${user.id}:`, profileError)
          errorCount++
          continue
        }

        if (!existingProfile) {
          // Create new profile
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              plano_ativo: true,
              stripe_customer_id: null
            })

          if (insertError) {
            console.error(`Error creating profile for user ${user.id}:`, insertError)
            errorCount++
          } else {
            console.log(`Created profile for user ${user.email}`)
            syncedCount++
          }
        } else {
          // Update existing profile to ensure plano_ativo = true
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              plano_ativo: true,
              email: user.email // Also update email in case it changed
            })
            .eq('user_id', user.id)

          if (updateError) {
            console.error(`Error updating profile for user ${user.id}:`, updateError)
            errorCount++
          } else {
            console.log(`Updated profile for user ${user.email}`)
            updatedCount++
          }
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        errorCount++
      }
    }

    const result = {
      success: true,
      totalUsers: users.users.length,
      profilesCreated: syncedCount,
      profilesUpdated: updatedCount,
      errors: errorCount,
      message: `Sync completed: ${syncedCount} profiles created, ${updatedCount} profiles updated, ${errorCount} errors`
    }

    console.log('Sync completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Sync failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to sync user profiles'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})