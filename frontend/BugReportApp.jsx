import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, where 
} from 'firebase/firestore';

// --- CONFIGURATION AND INITIALIZATION ---
// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { /* Mock Config for safety if running outside platform */ };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Status constants for bugs
const STATUSES = [
  { id: 'Open', color: 'bg-red-500', icon: '🚨' },
  { id: 'In Progress', color: 'bg-yellow-500', icon: '🛠️' },
  { id: 'Resolved', color: 'bg-green-500', icon: '✅' },
];

/**
 * Custom hook to handle Firebase initialization and authentication
 */
const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Auth state listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // Sign in anonymously if no custom token is available (for new/guest users)
          if (!initialAuthToken) {
            console.log("Signing in anonymously...");
            await signInAnonymously(firebaseAuth);
          } else {
            console.log("Awaiting custom token sign-in...");
          }
        }
        setIsAuthReady(true);
      });

      // Attempt custom token sign-in if provided
      const attemptSignIn = async () => {
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
            console.log("Signed in with custom token.");
          } catch (error) {
            console.error("Custom token sign-in failed:", error);
            // Fallback to anonymous if custom token fails
            await signInAnonymously(firebaseAuth);
          }
        }
      };
      
      if (initialAuthToken) {
        attemptSignIn();
      }

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setIsAuthReady(true); // Still mark as ready even if failed to allow UI rendering
    }
  }, []);

  // Public path for collaborative data
  const getPublicPath = useCallback((collectionName) => {
    return `artifacts/${appId}/public/data/${collectionName}`;
  }, []);

  return { db, auth, userId, isAuthReady, getPublicPath };
};


// --- UI COMPONENTS ---

const StatusBadge = ({ statusId }) => {
  const status = STATUSES.find(s => s.id === statusId) || STATUSES[0];
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-white ${status.color}`}>
      {status.icon} {status.id}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto transform transition-all p-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const CreateBugForm = ({ db, userId, getPublicPath, isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [imageCount, setImageCount] = useState(0); // Placeholder for image upload
  
  // Ensure form is reset when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setImageCount(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !db || !userId) return;

    setIsLoading(true);
    try {
      const bugData = {
        title,
        description,
        status: 'Open',
        priority,
        reporterId: userId,
        createdAt: serverTimestamp(),
        imageUrl: imageCount > 0 ? `https://placehold.co/600x400/222/fff?text=Image+Placeholder+(${imageCount})` : null,
      };

      const bugCollectionRef = collection(db, getPublicPath('bugs'));
      await addDoc(bugCollectionRef, bugData);

      onClose();
    } catch (error) {
      console.error("Error creating bug report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Bug Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            required
            data-testid="bug-title-input" // E2E Test ID
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            required
            data-testid="bug-description-input" // E2E Test ID
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              data-testid="bug-priority-select" // E2E Test ID
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          {/* Placeholder for Image Upload */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700">Images (Mock Upload)</label>
            <div className="flex items-center mt-1">
              <input
                type="number"
                min="0"
                max="3"
                value={imageCount}
                onChange={(e) => setImageCount(parseInt(e.target.value) || 0)}
                className="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
              <span className="ml-2 text-sm text-gray-500">files (0-3 for demo)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          data-testid="submit-bug-button" // E2E Test ID
        >
          {isLoading ? 'Submitting...' : 'Create Bug Report'}
        </button>
      </form>
    </Modal>
  );
};

const CommentForm = ({ db, userId, bugId, getPublicPath }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !db || !userId) return;

    setIsLoading(true);
    try {
      const commentData = {
        bugId,
        content,
        authorId: userId,
        createdAt: serverTimestamp(),
      };
      
      const commentsCollectionRef = collection(db, getPublicPath('comments'));
      await addDoc(commentsCollectionRef, commentData);
      
      setContent('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-lg font-semibold mb-2 text-gray-700">Add a Comment</h4>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="3"
        placeholder="Write your comment here..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border resize-none"
        required
        data-testid="comment-input" // E2E Test ID
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
        data-testid="submit-comment-button" // E2E Test ID
      >
        {isLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

const CommentList = ({ db, bugId, getPublicPath }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!db) return;

    const commentsPath = getPublicPath('comments');
    const q = query(
      collection(db, commentsPath),
      // Filtering comments by bugId is better handled by a dedicated field
      // but requires a composite index. For simplicity, we fetch all and filter in memory, 
      // or rely on a simple query if allowed by rules.
      // For this collaborative app, we'll try a query filter, though it might need an index.
      query(collection(db, commentsPath), where('bugId', '==', bugId), orderBy('createdAt', 'asc'))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));
      setComments(commentsData);
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, [db, bugId, getPublicPath]);
  
  // NOTE: Firestore `where` clause for `bugId` is used here. 
  // If this causes an error in your console, it means a composite index is missing.

  return (
    <div className="mt-6 border-t pt-4" data-testid="comment-list">
      <h3 className="text-xl font-bold text-gray-800 mb-3">Comments ({comments.length})</h3>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {comments.map(comment => (
          <div key={comment.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center text-sm mb-1">
              <span className="font-semibold text-indigo-600 truncate mr-2" title={`User ID: ${comment.authorId}`}>
                User: {comment.authorId.substring(0, 8)}...
              </span>
              <span className="text-gray-500 text-xs">
                {comment.createdAt}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

const BugDetailsModal = ({ isOpen, onClose, bug, db, userId, getPublicPath }) => {
  if (!bug) return null;

  const handleStatusChange = async (newStatus) => {
    if (!db) return;
    try {
      const bugDocRef = doc(db, getPublicPath('bugs'), bug.id);
      await updateDoc(bugDocRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating bug status:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bug: ${bug.title}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <StatusBadge statusId={bug.status} />
          <span className={`text-sm font-semibold p-1 rounded ${
            bug.priority === 'Critical' ? 'bg-red-200 text-red-800' : 
            bug.priority === 'High' ? 'bg-orange-200 text-orange-800' :
            'bg-gray-200 text-gray-800'
          }`}>
            Priority: {bug.priority}
          </span>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
        
        {bug.imageUrl && (
          <div className="my-4">
            <h4 className="font-semibold text-gray-700 mb-2">Screenshot:</h4>
            <img 
              src={bug.imageUrl} 
              alt="Bug Screenshot Placeholder" 
              className="w-full rounded-lg shadow-md max-h-64 object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/ccc/000?text=Image+Load+Failed" }}
            />
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>Reported by: <span className="font-mono text-indigo-600">{bug.reporterId.substring(0, 8)}...</span></p>
          <p>Created: {bug.createdAt}</p>
        </div>

        {/* Status Change Workflow */}
        <div className="pt-4 border-t">
          <h4 className="text-lg font-semibold mb-2 text-gray-700">Change Status</h4>
          <div className="flex space-x-2">
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => handleStatusChange(s.id)}
                disabled={bug.status === s.id}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg text-white transition disabled:opacity-70 disabled:cursor-not-allowed ${s.color}`}
                data-testid={`status-button-${s.id.toLowerCase().replace(' ', '-')}`} // E2E Test ID
              >
                Set to {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <CommentList db={db} bugId={bug.id} getPublicPath={getPublicPath} />
        <CommentForm db={db} userId={userId} bugId={bug.id} getPublicPath={getPublicPath} />
      </div>
    </Modal>
  );
};

const BugItem = ({ bug, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-indigo-500"
    data-testid={`bug-item-${bug.id}`} // E2E Test ID
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-bold text-gray-800 truncate pr-2" data-testid="bug-item-title">{bug.title}</h3>
      <StatusBadge statusId={bug.status} />
    </div>
    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{bug.description}</p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span>Priority: <span className="font-medium">{bug.priority}</span></span>
      <span>Reported: {bug.createdAt}</span>
    </div>
  </div>
);

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const { db, userId, isAuthReady, getPublicPath, auth } = useFirebase();
  const [bugs, setBugs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);

  // 1. Fetch Bug Reports
  useEffect(() => {
    if (!db || !isAuthReady) return;

    const bugsPath = getPublicPath('bugs');
    const q = query(collection(db, bugsPath), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bugData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));
      setBugs(bugData);
    }, (error) => {
      console.error("Error fetching bug reports:", error);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, getPublicPath]);
  
  // 2. Filter/Group Bugs by Status
  const groupedBugs = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status.id] = bugs.filter(bug => bug.status === status.id);
      return acc;
    }, {});
  }, [bugs]);

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        window.location.reload(); // Simple way to reset state/UI after signout
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-indigo-600">Loading BugReport+...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      {/* Header and Controls */}
      <header className="flex justify-between items-center mb-8 p-4 bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          BugReport+ <span className="text-gray-400 text-base">v1.0</span>
        </h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 hidden sm:block truncate">
            User ID: <span className="font-mono text-indigo-500">{userId || 'N/A'}</span>
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
            data-testid="report-new-bug-button" // E2E Test ID
          >
            + Report New Bug
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      {/* Kanban-style Bug Board (Responsive Grid) */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {STATUSES.map(status => (
          <div key={status.id} className="bg-white p-4 rounded-xl shadow-lg border-t-8" style={{borderColor: status.color.replace('bg-', '#').replace('-500', '00')}}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-gray-800">
              <span className="text-2xl">{status.icon}</span>
              <span data-testid={`bug-count-${status.id.toLowerCase().replace(' ', '-')}`}>{status.id} ({groupedBugs[status.id]?.length || 0})</span>
            </h2>
            <div className="space-y-4 min-h-[100px] max-h-[70vh] overflow-y-auto pr-2" data-testid={`bug-list-${status.id.toLowerCase().replace(' ', '-')}`}>
              {groupedBugs[status.id]?.map(bug => (
                <BugItem key={bug.id} bug={bug} onClick={() => setSelectedBug(bug)} />
              ))}
              {groupedBugs[status.id]?.length === 0 && (
                <p className="text-gray-400 italic text-center pt-4">No bugs in this status!</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateBugForm
        db={db}
        userId={userId}
        getPublicPath={getPublicPath}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <BugDetailsModal
        db={db}
        userId={userId}
        getPublicPath={getPublicPath}
        isOpen={!!selectedBug}
        bug={selectedBug}
        onClose={() => setSelectedBug(null)}
      />
    </div>
  );
}