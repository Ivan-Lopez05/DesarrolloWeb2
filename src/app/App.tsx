import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Dashboard } from './components/Dashboard';
import { ProfileForm } from './components/ProfileForm';
import { ProfileSelector } from './components/ProfileSelector';
import { Button } from './components/ui/button';
import { TopBar } from './components/layout/TopBar';
import { AboutPage } from './pages/AboutPage';
import { EditorPage } from './pages/EditorPage';
import { useProfileStore } from './store/profile-store';

type View = 'welcome' | 'editor' | 'about';
type Template = 'modern' | 'classic';

export default function App() {
  const profiles = useProfileStore((state) => state.profiles);
  const selectedProfileId = useProfileStore((state) => state.selectedProfileId);
  const showForm = useProfileStore((state) => state.showForm);
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null;

  const [view, setView] = useState<View>('welcome');
  const [template, setTemplate] = useState<Template>('modern');

  useEffect(() => {
    if (!selectedProfileId) {
      setView('welcome');
    }
  }, [selectedProfileId]);

  const onWelcomeScreen = !selectedProfile && !showForm && view !== 'about';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {selectedProfile && !showForm && <TopBar onAbout={() => setView('about')} />}

      {onWelcomeScreen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('about')}
          className="fixed left-4 top-4 z-50 text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground md:left-6 md:top-6"
        >
          about us
        </Button>
      )}

      <div className={selectedProfile && !showForm ? 'pt-14' : ''}>
        {!selectedProfile && !showForm && view !== 'about' && <ProfileSelector />}
        {showForm && <ProfileForm />}

        {selectedProfile && !showForm && view === 'welcome' && (
          <Dashboard profile={selectedProfile} onSelectDocument={(nextTemplate) => {
            setTemplate(nextTemplate);
            setView('editor');
          }} />
        )}

        {selectedProfile && !showForm && view === 'editor' && (
          <EditorPage
            profile={selectedProfile}
            template={template}
            onTemplateChange={setTemplate}
            onBack={() => setView('welcome')}
          />
        )}

        {!showForm && view === 'about' && (
          <AboutPage onBack={() => setView('welcome')} />
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}
