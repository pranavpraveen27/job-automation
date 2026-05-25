import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, Github, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    linkedinUrl: user.linkedinUrl || '',
    githubUrl: user.githubUrl || '',
    portfolioUrl: user.portfolioUrl || '',
  });

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">Account</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Profile</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Manage your personal and professional information.</p>
          </div>
          <User className="h-12 w-12 text-sky-400/40" />
        </div>
      </section>

      {/* Profile Info */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Personal Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200">
                {profile.fullName || 'Not set'}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200">
              {profile.email}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200">
                {profile.phone || 'Not set'}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200">
                {profile.location || 'Not set'}
              </div>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500 text-sm"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200 text-sm">
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    View Profile
                  </a>
                ) : (
                  'Not set'
                )}
              </div>
            )}
          </div>

          {/* GitHub */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <Github className="h-4 w-4" />
              GitHub
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profile.githubUrl}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500 text-sm"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200 text-sm">
                {profile.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    View Profile
                  </a>
                ) : (
                  'Not set'
                )}
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="lg:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
              <LinkIcon className="h-4 w-4" />
              Portfolio Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                placeholder="https://myportfolio.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500 text-sm"
              />
            ) : (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-slate-200 text-sm">
                {profile.portfolioUrl ? (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                    Visit Portfolio
                  </a>
                ) : (
                  'Not set'
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-end gap-3"
          >
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-6 py-2 font-semibold text-slate-200 transition hover:border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2 font-semibold text-white transition hover:shadow-lg hover:shadow-sky-500/30"
            >
              Save Changes
            </button>
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}

export default Profile;
