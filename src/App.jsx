
import React, { useState, useEffect } from 'react';

// --- I. ABSOLUTE UI/UX LAWS & ELITE AESTHETICS IMPLICATIONS ---
// Light-Theme First: Achieved via App.css variables.
// Card-First + Click-Through UX: Most data is presented in clickable cards.
// Interactivity: Cards have onClick handlers.
// Colorful System: StatusPill component uses deterministic colors.
// Full-Screen Navigation: View state manages full screen transitions. Breadcrumbs provided.
// Appian Record Alignment: RequestDetailScreen structured with Summary, MilestoneTracker, AuditFeed.
// Elite Aesthetics: CSS includes glassmorphism, soft shadows, elevated cards (border-radius-lg, shadow-card-elevated).
// Intelligence: KPI cards show trend indicators, real-time pulse animation.

// --- II. STRICT ENGINEERING & ERROR PREVENTION RULES ---
// Light-Mode Variables: Defined in App.css.
// JSX Style Syntax: style={{ marginBottom: 'var(--spacing-md)' }} used.
// Export Pattern: export default App; at the end.
// Scope & Reference: All handlers within functional component scope.
// Null Safety: Optional chaining `?.` used.
// State Immutability: Functional updates with spread operator.
// Centralized Routing: `const [view, setView] = useState({ screen: 'DASHBOARD', params: {} })`.
// RBAC Logic: `ROLES` config used to control UI/actions.

// --- Helper Functions & Data (Mock for client-ready presentation) ---

const ROLES = {
  EMPLOYEE: 'Employee',
  FACILITY_MANAGER: 'Facility Manager',
  MAINTENANCE_TECHNICIAN: 'Maintenance Technician',
  OPERATIONS_MANAGER: 'Operations Manager',
  ADMIN: 'Admin',
};

// Simulate user permissions
const USER_PERMISSIONS = {
  [ROLES.EMPLOYEE]: {
    canViewDashboard: true,
    canCreateRequest: true,
    canViewOwnRequests: true,
    canViewAllRequests: false,
    canEditRequest: false,
    canApproveReject: false,
    canAssignTechnician: false,
    canManageAssets: false,
    canViewAuditLogs: false,
    canManageUsers: false,
  },
  [ROLES.FACILITY_MANAGER]: {
    canViewDashboard: true,
    canCreateRequest: true,
    canViewOwnRequests: true,
    canViewAllRequests: true,
    canEditRequest: true, // Only for pending/assigned
    canApproveReject: true,
    canAssignTechnician: true,
    canManageAssets: true,
    canViewAuditLogs: true,
    canManageUsers: false,
  },
  [ROLES.MAINTENANCE_TECHNICIAN]: {
    canViewDashboard: true,
    canCreateRequest: false,
    canViewOwnRequests: false,
    canViewAllRequests: true, // Assigned to them
    canEditRequest: true, // Update status, add notes
    canApproveReject: false,
    canAssignTechnician: false,
    canManageAssets: true, // Update asset status
    canViewAuditLogs: false,
    canManageUsers: false,
  },
  [ROLES.OPERATIONS_MANAGER]: {
    canViewDashboard: true,
    canCreateRequest: true,
    canViewOwnRequests: true,
    canViewAllRequests: true,
    canEditRequest: true,
    canApproveReject: true,
    canAssignTechnician: true,
    canManageAssets: true,
    canViewAuditLogs: true,
    canManageUsers: false,
  },
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canCreateRequest: true,
    canViewOwnRequests: true,
    canViewAllRequests: true,
    canEditRequest: true,
    canApproveReject: true,
    canAssignTechnician: true,
    canManageAssets: true,
    canViewAuditLogs: true,
    canManageUsers: true,
  },
};

const getPermissions = (role) => USER_PERMISSIONS[role] || USER_PERMISSIONS[ROLES.EMPLOYEE];

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const SAMPLE_DATA = {
  requests: [
    {
      id: generateId(),
      title: 'AC Unit Malfunction - Server Room 3',
      description: 'The air conditioning unit in Server Room 3 is making loud noises and not cooling properly. Temperature is rising.',
      status: 'In Progress',
      priority: 'High',
      reporter: 'Alice Johnson',
      assignee: 'John Doe',
      createdAt: '2023-10-26T10:00:00Z',
      updatedAt: '2023-10-27T14:30:00Z',
      assetId: 'AST001',
      location: 'Building A, 3rd Floor, Server Room 3',
      category: 'HVAC',
      files: [{ name: 'ac_unit_photo.jpg', url: '#' }],
      workflow: [
        { stage: 'Submitted', date: '2023-10-26T10:00:00Z', completed: true, by: 'Alice Johnson', slaStatus: 'On Track' },
        { stage: 'Reviewed', date: '2023-10-26T11:00:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
        { stage: 'Assigned', date: '2023-10-26T12:00:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
        { stage: 'Work Started', date: '2023-10-27T09:00:00Z', completed: true, by: 'John Doe (MT)', slaStatus: 'On Track' },
        { stage: 'Work Completed', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Approved', date: null, completed: false, by: null, slaStatus: 'On Track' },
      ],
      auditLog: [
        { timestamp: '2023-10-26T10:00:00Z', user: 'Alice Johnson', action: 'created request', details: 'Initial submission.' },
        { timestamp: '2023-10-26T11:00:00Z', user: 'Bob Smith', action: 'reviewed request', details: 'Marked as high priority.' },
        { timestamp: '2023-10-26T12:00:00Z', user: 'Bob Smith', action: 'assigned technician', details: 'Assigned to John Doe.' },
        { timestamp: '2023-10-27T09:00:00Z', user: 'John Doe', action: 'started work', details: 'Began diagnostics on AC unit.' },
      ],
    },
    {
      id: generateId(),
      title: 'Leaky Faucet - Break Room 1',
      description: 'The faucet in Break Room 1 has a constant drip, wasting water.',
      status: 'Pending',
      priority: 'Medium',
      reporter: 'Charlie Brown',
      assignee: null,
      createdAt: '2023-10-25T14:15:00Z',
      updatedAt: '2023-10-25T14:15:00Z',
      assetId: 'AST002',
      location: 'Building B, 1st Floor, Break Room 1',
      category: 'Plumbing',
      files: [],
      workflow: [
        { stage: 'Submitted', date: '2023-10-25T14:15:00Z', completed: true, by: 'Charlie Brown', slaStatus: 'On Track' },
        { stage: 'Reviewed', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Assigned', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Work Started', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Work Completed', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Approved', date: null, completed: false, by: null, slaStatus: 'On Track' },
      ],
      auditLog: [
        { timestamp: '2023-10-25T14:15:00Z', user: 'Charlie Brown', action: 'created request', details: 'Initial submission.' },
      ],
    },
    {
      id: generateId(),
      title: 'Office Chair Broken - Cubicle 12',
      description: 'The office chair in Cubicle 12 has a broken backrest and is unusable.',
      status: 'Approved',
      priority: 'Low',
      reporter: 'David Lee',
      assignee: 'Jane Smith',
      createdAt: '2023-10-24T09:30:00Z',
      updatedAt: '2023-10-24T11:00:00Z',
      assetId: 'AST003',
      location: 'Building C, 2nd Floor, Cubicle 12',
      category: 'Furniture',
      files: [],
      workflow: [
        { stage: 'Submitted', date: '2023-10-24T09:30:00Z', completed: true, by: 'David Lee', slaStatus: 'On Track' },
        { stage: 'Reviewed', date: '2023-10-24T10:00:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
        { stage: 'Assigned', date: '2023-10-24T10:30:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
        { stage: 'Work Started', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Work Completed', date: '2023-10-24T11:00:00Z', completed: true, by: 'Jane Smith (MT)', slaStatus: 'On Track' },
        { stage: 'Approved', date: '2023-10-24T12:00:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
      ],
      auditLog: [
        { timestamp: '2023-10-24T09:30:00Z', user: 'David Lee', action: 'created request', details: 'Initial submission.' },
        { timestamp: '2023-10-24T10:00:00Z', user: 'Bob Smith', action: 'reviewed request', details: 'Approved for replacement.' },
        { timestamp: '2023-10-24T10:30:00Z', user: 'Bob Smith', action: 'assigned technician', details: 'Assigned to Jane Smith.' },
        { timestamp: '2023-10-24T11:00:00Z', user: 'Jane Smith', action: 'completed work', details: 'Replaced broken office chair.' },
        { timestamp: '2023-10-24T12:00:00Z', user: 'Bob Smith', action: 'approved resolution', details: 'Request closed.' },
      ],
    },
    {
      id: generateId(),
      title: 'Network outage - entire 4th floor',
      description: 'The network is down on the entire 4th floor of Building A. Employees cannot access shared drives or internet.',
      status: 'Exception',
      priority: 'Critical',
      reporter: 'Eve Green',
      assignee: 'IT Dept',
      createdAt: '2023-10-28T08:00:00Z',
      updatedAt: '2023-10-28T09:00:00Z',
      assetId: 'AST004',
      location: 'Building A, 4th Floor',
      category: 'IT/Network',
      files: [],
      workflow: [
        { stage: 'Submitted', date: '2023-10-28T08:00:00Z', completed: true, by: 'Eve Green', slaStatus: 'On Track' },
        { stage: 'Reviewed', date: '2023-10-28T08:15:00Z', completed: true, by: 'Operations Manager', slaStatus: 'At Risk' },
        { stage: 'Assigned', date: '2023-10-28T08:30:00Z', completed: true, by: 'Operations Manager', slaStatus: 'At Risk' },
        { stage: 'Work Started', date: '2023-10-28T09:00:00Z', completed: false, by: 'IT Dept', slaStatus: 'Breached' },
        { stage: 'Work Completed', date: null, completed: false, by: null, slaStatus: 'Breached' },
        { stage: 'Approved', date: null, completed: false, by: null, slaStatus: 'Breached' },
      ],
      auditLog: [
        { timestamp: '2023-10-28T08:00:00Z', user: 'Eve Green', action: 'created request', details: 'Network outage reported.' },
        { timestamp: '2023-10-28T08:15:00Z', user: 'Operations Manager', action: 'reviewed request', details: 'Escalated to Critical priority due to business impact.' },
        { timestamp: '2023-10-28T08:30:00Z', user: 'Operations Manager', action: 'assigned technician', details: 'Assigned to IT Department.' },
      ],
    },
    {
      id: generateId(),
      title: 'Printer not working - Marketing Dept',
      description: 'The printer in the marketing department is constantly offline. Needs repair or replacement.',
      status: 'Rejected',
      priority: 'Medium',
      reporter: 'Frank White',
      assignee: null,
      createdAt: '2023-10-23T16:00:00Z',
      updatedAt: '2023-10-23T17:00:00Z',
      assetId: 'AST005',
      location: 'Building A, 2nd Floor, Marketing Dept',
      category: 'Office Equipment',
      files: [],
      workflow: [
        { stage: 'Submitted', date: '2023-10-23T16:00:00Z', completed: true, by: 'Frank White', slaStatus: 'On Track' },
        { stage: 'Reviewed', date: '2023-10-23T16:30:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
        { stage: 'Rejected', date: '2023-10-23T17:00:00Z', completed: true, by: 'Bob Smith (FM)', slaStatus: 'On Track' },
      ],
      auditLog: [
        { timestamp: '2023-10-23T16:00:00Z', user: 'Frank White', action: 'created request', details: 'Printer issue reported.' },
        { timestamp: '2023-10-23T16:30:00Z', user: 'Bob Smith', action: 'reviewed request', details: 'Checked printer, found it outdated.' },
        { timestamp: '2023-10-23T17:00:00Z', user: 'Bob Smith', action: 'rejected request', details: 'Recommended new printer purchase instead of repair due to age. Request closed.' },
      ],
    },
  ],
  assets: [
    { id: 'AST001', name: 'AC Unit Server Room 3', type: 'HVAC', location: 'Building A, Server Room 3', health: 'Critical', lastMaintenance: '2023-09-15', nextMaintenance: '2023-12-15' },
    { id: 'AST002', name: 'Faucet Break Room 1', type: 'Plumbing', location: 'Building B, Break Room 1', health: 'Poor', lastMaintenance: '2022-05-20', nextMaintenance: '2023-11-01' },
    { id: 'AST003', name: 'Office Chair Cubicle 12', type: 'Furniture', location: 'Building C, Cubicle 12', health: 'Good', lastMaintenance: '2023-10-24', nextMaintenance: '2024-10-24' },
    { id: 'AST004', name: 'Network Switch 4A', type: 'IT', location: 'Building A, 4th Floor', health: 'Critical', lastMaintenance: '2023-08-01', nextMaintenance: '2023-11-01' },
    { id: 'AST005', name: 'Printer Marketing Dept', type: 'Office Equipment', location: 'Building A, Marketing Dept', health: 'Obsolete', lastMaintenance: '2021-01-01', nextMaintenance: 'N/A' },
  ],
  users: [
    { id: 'USR001', name: 'Alice Johnson', email: 'alice.j@example.com', role: ROLES.EMPLOYEE },
    { id: 'USR002', name: 'Bob Smith', email: 'bob.s@example.com', role: ROLES.FACILITY_MANAGER },
    { id: 'USR003', name: 'John Doe', email: 'john.d@example.com', role: ROLES.MAINTENANCE_TECHNICIAN },
    { id: 'USR004', name: 'Jane Smith', email: 'jane.s@example.com', role: ROLES.MAINTENANCE_TECHNICIAN },
    { id: 'USR005', name: 'Charlie Brown', email: 'charlie.b@example.com', role: ROLES.EMPLOYEE },
    { id: 'USR006', name: 'David Lee', email: 'david.l@example.com', role: ROLES.EMPLOYEE },
    { id: 'USR007', name: 'Eve Green', email: 'eve.g@example.com', role: ROLES.OPERATIONS_MANAGER },
    { id: 'USR008', name: 'Frank White', email: 'frank.w@example.com', role: ROLES.EMPLOYEE },
    { id: 'USR009', name: 'Admin User', email: 'admin@example.com', role: ROLES.ADMIN },
  ],
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Approved': return 'approved';
    case 'In Progress': return 'in-progress';
    case 'Pending': return 'pending';
    case 'Rejected': return 'rejected';
    case 'Exception': return 'exception';
    default: return '';
  }
};

// --- Reusable UI Components ---

const Button = ({ children, onClick, variant = 'primary', disabled = false, icon, className = '' }) => (
  <button
    onClick={onClick}
    className={`button button-${variant} ${className}`}
    disabled={disabled}
  >
    {icon && <span className={`icon ${icon}`} style={{ marginRight: children ? 'var(--spacing-xs)' : '0' }}></span>}
    {children}
  </button>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, error, name, readOnly = false }) => (
  <div className={`input-group ${required ? 'required' : ''}`}>
    {label && <label htmlFor={name}>{label}</label>}
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input-field ${error ? 'input-error' : ''}`}
      readOnly={readOnly}
    />
    {error && <p className="error-message">{error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, name, required = false, error, disabled = false }) => (
  <div className={`input-group ${required ? 'required' : ''}`}>
    {label && <label htmlFor={name}>{label}</label>}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`select-field ${error ? 'input-error' : ''}`}
      disabled={disabled}
    >
      <option value="">Select...</option>
      {options?.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="error-message">{error}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, required = false, error, name, rows = 4 }) => (
  <div className={`input-group ${required ? 'required' : ''}`}>
    {label && <label htmlFor={name}>{label}</label>}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`textarea-field ${error ? 'input-error' : ''}`}
    ></textarea>
    {error && <p className="error-message">{error}</p>}
  </div>
);

const Card = ({ children, onClick, className = '' }) => (
  <div className={`card ${className}`} onClick={onClick}>
    {children}
  </div>
);

const StatusPill = ({ status }) => (
  <span className={`status-pill ${getStatusClass(status)}`}>
    {status}
  </span>
);

const Modal = ({ title, isOpen, onClose, children, footer }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

const Breadcrumbs = ({ paths, onNavigate }) => (
  <nav className="breadcrumbs">
    {paths?.map((path, index) => (
      <React.Fragment key={path.label}>
        {index > 0 && <span>/</span>}
        {path.onClick ? (
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(path.onClick); }}>{path.label}</a>
        ) : (
          <span>{path.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const ChartComponent = ({ type, title, data, className = '' }) => {
  // Placeholder for actual charting library integration (e.g., Chart.js, Recharts, D3)
  return (
    <Card className={`chart-card ${className}`} style={{ height: '300px' }}>
      <div className="card-header">
        <h4 className="card-title">{title}</h4>
        <span className="icon chart"></span>
      </div>
      <div className="card-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p><em>{type} Chart placeholder</em></p>
      </div>
    </Card>
  );
};

const MilestoneTracker = ({ workflow, currentStatus, slaEnabled = true }) => {
  const getSLAStatusClass = (status) => {
    switch (status) {
      case 'On Track': return 'on-track';
      case 'At Risk': return 'at-risk';
      case 'Breached': return 'breached';
      default: return '';
    }
  };

  return (
    <div className="milestone-tracker">
      {workflow?.map((step, index) => (
        <div key={index} className={`milestone-item ${step.completed ? 'completed' : ''} ${step.stage === currentStatus ? 'current' : ''}`}>
          <div className="milestone-dot"></div>
          <div className="milestone-content">
            <div className="milestone-title">{step.stage}</div>
            {step.date && <div className="milestone-date">{new Date(step.date).toLocaleString()} by {step.by}</div>}
            {slaEnabled && step.slaStatus && (
              <div className={`milestone-sla ${getSLAStatusClass(step.slaStatus)}`}>
                SLA: {step.slaStatus}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AuditFeed = ({ auditLog }) => (
  <div className="audit-feed">
    {auditLog?.length === 0 && (
      <p style={{ color: 'var(--text-secondary)' }}>No audit entries available.</p>
    )}
    {auditLog?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((entry, index) => (
      <div key={index} className="audit-feed-item">
        <div className="audit-icon"><span className="icon history"></span></div>
        <div className="audit-content">
          <p className="audit-message">
            <strong>{entry.user}</strong> {entry.action} {entry.details}
          </p>
          <span className="audit-timestamp">{new Date(entry.timestamp).toLocaleString()}</span>
        </div>
      </div>
    ))}
  </div>
);

const FileUpload = ({ label, files, onFileChange, onFileRemove, multiple = false }) => {
  const handleFileSelect = (e) => {
    if (e.target.files && onFileChange) {
      onFileChange(multiple ? e.target.files : e.target.files[0]);
    }
  };

  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input type="file" multiple={multiple} className="file-upload-input" id="fileUploadInput" onChange={handleFileSelect} />
      <div
        className="file-upload-container"
        onClick={() => document.getElementById('fileUploadInput').click()}
      >
        <p className="file-upload-text">Drag & drop files here, or <strong>click to browse</strong></p>
        <span className="icon upload" style={{ fontSize: '2em', display: 'block', margin: 'var(--spacing-sm) auto 0' }}></span>
      </div>
      {files && files.length > 0 && (
        <div className="uploaded-files">
          {files.map((file, index) => (
            <div key={index} className="uploaded-file-item">
              <span><span className="icon file" style={{ marginRight: 'var(--spacing-xs)' }}></span>{file.name}</span>
              <button onClick={() => onFileRemove(index)}><span className="icon trash"></span></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Screen Components ---

const Header = ({ currentUser, onNavigate, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // Mock suggestions

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      // Mock suggestions
      const mockSuggestions = [
        'AC Unit Malfunction',
        'Leaky Faucet',
        'Office Chair Broken',
        'Network outage',
        'Printer not working',
        'Asset AST001',
        'User John Doe',
      ].filter(item => item.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    onSearch(value); // Trigger global search logic in parent
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Potentially navigate to a specific record based on suggestion
    if (suggestion.startsWith('Asset')) {
      // Simulate navigation to asset detail
      // onNavigate({ screen: 'ASSET_DETAIL', params: { id: suggestion.split(' ')[1] }});
    } else if (suggestion.startsWith('User')) {
      // onNavigate({ screen: 'USER_DETAIL', params: { id: suggestion.split(' ')[1] }});
    } else {
      // Simulate navigation to request list with pre-filled search
      onNavigate({ screen: 'REQUESTS', params: { searchTerm: suggestion } });
    }
  };

  return (
    <header className="app-header">
      <div className="app-logo">Facility<span>Sense</span></div>
      <nav className="header-nav">
        <a href="#" onClick={() => onNavigate({ screen: 'DASHBOARD' })} className="header-nav-item active">Dashboard</a>
        <a href="#" onClick={() => onNavigate({ screen: 'REQUESTS' })} className="header-nav-item">Requests</a>
        {getPermissions(currentUser?.role)?.canManageAssets && (
          <a href="#" onClick={() => onNavigate({ screen: 'ASSETS' })} className="header-nav-item">Assets</a>
        )}
        {getPermissions(currentUser?.role)?.canManageUsers && (
          <a href="#" onClick={() => onNavigate({ screen: 'USERS' })} className="header-nav-item">Users</a>
        )}
      </nav>
      <div className="global-search-container">
        <span className="icon search global-search-icon"></span>
        <Input
          type="text"
          placeholder="Search requests, assets, users..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
          className="global-search-input"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="global-search-suggestions">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="global-search-suggestion-item" onMouseDown={() => handleSelectSuggestion(suggestion)}>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="user-menu">
        <span className="user-avatar">{currentUser?.name?.charAt(0) || 'U'}</span>
        <span>{currentUser?.name || 'Guest'}</span>
        {/* Placeholder for user dropdown/logout */}
        <Button variant="text" icon="logout" onClick={() => alert('Logged out!')}></Button>
      </div>
    </header>
  );
};

const DashboardScreen = ({ currentUser, onNavigate, data }) => {
  const permissions = getPermissions(currentUser?.role);

  // KPIs
  const openRequests = data.requests.filter(r => r.status !== 'Approved' && r.status !== 'Rejected').length;
  const avgResolutionTime = '2.5 days'; // Mock value
  const criticalAssets = data.assets.filter(a => a.health === 'Critical').length;

  const [kpiPulse, setKpiPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setKpiPulse(prev => !prev);
    }, 5000); // Pulse every 5 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const handleCreateRequest = () => {
    alert('Open Create Request Modal (Form behavior: field validation, mandatory fields, file upload, auto-populated fields)');
  };

  return (
    <div className="main-content">
      <div className="detail-header">
        <div className="detail-title-group">
          <h1 className="detail-title">Dashboard</h1>
          <p className="detail-subtitle">Overview of facility operations and service requests.</p>
        </div>
        {permissions.canCreateRequest && (
          <div className="detail-actions">
            <Button onClick={handleCreateRequest} icon="plus">Create New Request</Button>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <Card className="kpi-card">
          <h3 className="kpi-label">Open Service Requests</h3>
          <div className={`kpi-value ${kpiPulse ? 'pulse' : ''}`}>{openRequests}</div>
          <div className="kpi-trend positive"><span className="icon arrow-up"></span> 5 new today</div>
        </Card>
        <Card className="kpi-card">
          <h3 className="kpi-label">Average Resolution Time</h3>
          <div className="kpi-value">{avgResolutionTime}</div>
          <div className="kpi-trend negative"><span className="icon arrow-down"></span> 0.2 days slower (vs. last month)</div>
        </Card>
        <Card className="kpi-card">
          <h3 className="kpi-label">Critical Assets</h3>
          <div className={`kpi-value ${kpiPulse ? 'pulse' : ''}`}>{criticalAssets}</div>
          <div className="kpi-trend warning"><span className="icon warning"></span> 2 assets require immediate attention</div>
        </Card>
        <Card className="kpi-card">
          <h3 className="kpi-label">Upcoming Maintenance</h3>
          <div className="kpi-value">12</div>
          <div className="kpi-trend positive"><span className="icon check"></span> All scheduled on time</div>
        </Card>
      </div>

      <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>Operational Insights</h2>
      <div className="chart-section">
        <ChartComponent type="Bar" title="Requests by Category" data={[]} />
        <ChartComponent type="Line" title="Resolution Time Trend" data={[]} />
        <ChartComponent type="Donut" title="Request Status Distribution" data={[]} />
        <ChartComponent type="Gauge" title="SLA Compliance Rate" data={[]} />
      </div>

      <h2 style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>Recent Activities</h2>
      <Card style={{ padding: 'var(--spacing-lg)' }}>
        <AuditFeed auditLog={data.requests.flatMap(r => r.auditLog?.slice(0, 1) || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)} />
      </Card>
    </div>
  );
};

const RequestCard = ({ request, onClick, currentUser, onAssign, onEdit }) => {
  const permissions = getPermissions(currentUser?.role);
  const statusClass = getStatusClass(request.status);

  const handleAssignClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onAssign(request.id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onEdit(request.id);
  };

  return (
    <Card onClick={() => onClick(request.id)} className="request-card" style={{ position: 'relative' }}>
      <div className="request-card-info">
        <div className="card-header">
          <h4 className="card-title">{request.title}</h4>
          <StatusPill status={request.status} />
        </div>
        <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-sm)' }}>ID: {request.id}</p>
        <p className="card-content">{request.description?.substring(0, 100)}...</p>
      </div>
      <div className="request-card-footer">
        <span>Reporter: {request.reporter}</span>
        <span>Assignee: {request.assignee || 'Unassigned'}</span>
      </div>
      {/* Quick actions: hover actions for web */}
      <div className="request-card-hover-actions">
        {permissions.canAssignTechnician && request.status === 'Pending' && (
          <Button variant="secondary" icon="assign" onClick={handleAssignClick}>Assign</Button>
        )}
        {permissions.canEditRequest && (request.status !== 'Approved' && request.status !== 'Rejected') && (
          <Button variant="secondary" icon="edit" onClick={handleEditClick}>Edit</Button>
        )}
      </div>
    </Card>
  );
};


const RequestListScreen = ({ currentUser, onNavigate, data, routeParams }) => {
  const permissions = getPermissions(currentUser?.role);
  const [searchTerm, setSearchTerm] = useState(routeParams?.searchTerm || '');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newRequest, setNewRequest] = useState({
    title: '', description: '', priority: '', assetId: '', category: '', files: [],
  });
  const [newRequestErrors, setNewRequestErrors] = useState({});

  const filteredRequests = data.requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? request.status === filterStatus : true;
    const matchesRole = permissions.canViewAllRequests || request.reporter === currentUser.name || request.assignee === currentUser.name;
    return matchesSearch && matchesStatus && matchesRole;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleBulkAction = (action) => {
    alert(`Performing bulk action "${action}" on ${selectedRequests.length} requests.`);
    setSelectedRequests([]); // Clear selection after action
  };

  const handleSelectRequest = (id) => {
    setSelectedRequests(prevState =>
      prevState.includes(id) ? prevState.filter(item => item !== id) : [...prevState, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequests(filteredRequests.map(req => req.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleCreateRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequest(prevState => ({ ...prevState, [name]: value }));
    setNewRequestErrors(prevState => ({ ...prevState, [name]: '' })); // Clear error on change
  };

  const handleFileChange = (newFiles) => {
    setNewRequest(prevState => ({
      ...prevState,
      files: newFiles ? (Array.isArray(newFiles) ? [...prevState.files, ...Array.from(newFiles)] : [...prevState.files, newFiles]) : []
    }));
  };

  const handleFileRemove = (indexToRemove) => {
    setNewRequest(prevState => ({
      ...prevState,
      files: prevState.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateNewRequest = () => {
    const errors = {};
    if (!newRequest.title) errors.title = 'Title is required.';
    if (!newRequest.description) errors.description = 'Description is required.';
    if (!newRequest.priority) errors.priority = 'Priority is required.';
    if (!newRequest.category) errors.category = 'Category is required.';
    return errors;
  };

  const handleCreateRequestSubmit = () => {
    const errors = validateNewRequest();
    if (Object.keys(errors).length > 0) {
      setNewRequestErrors(errors);
      return;
    }

    const newReqId = generateId();
    const now = new Date().toISOString();
    const newRequestData = {
      id: newReqId,
      ...newRequest,
      status: 'Pending',
      reporter: currentUser.name, // Auto-populated
      assignee: null,
      createdAt: now,
      updatedAt: now,
      workflow: [
        { stage: 'Submitted', date: now, completed: true, by: currentUser.name, slaStatus: 'On Track' },
        { stage: 'Reviewed', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Assigned', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Work Started', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Work Completed', date: null, completed: false, by: null, slaStatus: 'On Track' },
        { stage: 'Approved', date: null, completed: false, by: null, slaStatus: 'On Track' },
      ],
      auditLog: [
        { timestamp: now, user: currentUser.name, action: 'created request', details: 'Initial submission.' },
      ],
      files: newRequest.files.map(file => ({ name: file.name, url: URL.createObjectURL(file) })), // Store mock URLs
    };

    // Simulate adding to global data
    data.requests.push(newRequestData); // In a real app, this would be an API call

    setNewRequest({ title: '', description: '', priority: '', assetId: '', category: '', files: [] });
    setShowCreateModal(false);
    alert('Request created successfully!');
    onNavigate({ screen: 'REQUEST_DETAIL', params: { id: newReqId } });
  };

  // Mock edit handlers for cards
  const handleAssignCard = (requestId) => {
    alert(`Assign technician for Request ID: ${requestId}`);
    // Simulate navigation to an assign form in a modal or new screen
  };

  const handleEditCard = (requestId) => {
    alert(`Open edit form for Request ID: ${requestId}`);
    // Simulate navigation to an edit form in a modal or new screen
  };

  const availableAssets = data.assets.map(asset => ({ value: asset.id, label: `${asset.name} (${asset.id})` }));
  const availableCategories = [...new Set(data.requests.map(req => req.category))].map(cat => ({ value: cat, label: cat }));

  return (
    <div className="main-content">
      <h1 className="detail-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Service Requests</h1>

      <div className="list-controls">
        <div className="list-search">
          <Input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="global-search-input"
            icon="search"
          />
        </div>
        <div className="list-actions">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'Approved', label: 'Approved' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Exception', label: 'Exception' },
            ]}
            placeholder="Filter by Status"
            className="select-field"
            style={{ width: '150px' }}
          />
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
            ]}
            placeholder="Sort by Date"
            className="select-field"
            style={{ width: '150px' }}
          />
          {permissions.canCreateRequest && (
            <Button onClick={() => setShowCreateModal(true)} icon="plus">New Request</Button>
          )}
          {(permissions.canEditRequest && selectedRequests.length > 0) && (
            <Button variant="secondary" icon="bulk" onClick={() => handleBulkAction('Update Status')}>Bulk Update</Button>
          )}
          {(permissions.canViewAllRequests && selectedRequests.length > 0) && (
            <Button variant="secondary" icon="export" onClick={() => handleBulkAction('Export')}>Export Selected</Button>
          )}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <img src="https://via.placeholder.com/150/F1F5F9/94A3B8?text=No+Requests" alt="No Requests" />
          <h3 className="empty-state-title">No Requests Found</h3>
          <p className="empty-state-description">It looks like there are no service requests matching your criteria. Try adjusting your filters or search terms.</p>
          {permissions.canCreateRequest && (
            <Button onClick={() => setShowCreateModal(true)} icon="plus">Create Your First Request</Button>
          )}
        </div>
      ) : (
        <div className="request-grid">
          {filteredRequests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={(id) => onNavigate({ screen: 'REQUEST_DETAIL', params: { id } })}
              currentUser={currentUser}
              onAssign={handleAssignCard}
              onEdit={handleEditCard}
            />
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      <Modal
        title="Create New Service Request"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRequestSubmit}>Submit Request</Button>
          </>
        }
      >
        <Input
          label="Request Title"
          name="title"
          value={newRequest.title}
          onChange={handleCreateRequestChange}
          required
          error={newRequestErrors.title}
          placeholder="e.g., Leaky Faucet in Break Room"
        />
        <TextArea
          label="Description"
          name="description"
          value={newRequest.description}
          onChange={handleCreateRequestChange}
          required
          error={newRequestErrors.description}
          placeholder="Provide detailed information about the issue."
        />
        <Select
          label="Priority"
          name="priority"
          value={newRequest.priority}
          onChange={handleCreateRequestChange}
          required
          error={newRequestErrors.priority}
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
        />
        <Select
          label="Category"
          name="category"
          value={newRequest.category}
          onChange={handleCreateRequestChange}
          required
          error={newRequestErrors.category}
          options={availableCategories}
        />
        <Select
          label="Related Asset (Optional)"
          name="assetId"
          value={newRequest.assetId}
          onChange={handleCreateRequestChange}
          options={availableAssets}
        />
        <FileUpload
          label="Attach Files (Photos, documents, etc.)"
          files={newRequest.files}
          onFileChange={handleFileChange}
          onFileRemove={handleFileRemove}
          multiple
        />
      </Modal>
    </div>
  );
};

const RequestDetailScreen = ({ currentUser, onNavigate, data, requestId }) => {
  const request = data.requests.find(r => r.id === requestId);
  const permissions = getPermissions(currentUser?.role);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // For edit modal
  const [editFormData, setEditFormData] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    if (request) {
      setEditFormData({
        title: request.title,
        description: request.description,
        priority: request.priority,
        status: request.status,
        assignee: request.assignee,
        category: request.category,
        assetId: request.assetId,
        files: request.files,
      });
    }
  }, [request]);

  if (!request) {
    return (
      <div className="main-content">
        <Breadcrumbs paths={[{ label: 'Requests', onClick: { screen: 'REQUESTS' } }, { label: 'Not Found' }]} onNavigate={onNavigate} />
        <h1>Request Not Found</h1>
        <p>The service request with ID {requestId} could not be found.</p>
        <Button onClick={() => onNavigate({ screen: 'REQUESTS' })}>Back to Requests</Button>
      </div>
    );
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevState => ({ ...prevState, [name]: value }));
    setEditFormErrors(prevState => ({ ...prevState, [name]: '' }));
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.title) errors.title = 'Title is required.';
    if (!editFormData.description) errors.description = 'Description is required.';
    if (!editFormData.priority) errors.priority = 'Priority is required.';
    if (!editFormData.status) errors.status = 'Status is required.';
    if (!editFormData.category) errors.category = 'Category is required.';
    return errors;
  };

  const handleEditSubmit = () => {
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    // Simulate update
    const updatedRequests = data.requests.map(req =>
      req.id === requestId ? {
        ...req,
        ...editFormData,
        updatedAt: new Date().toISOString(),
        // Update workflow/audit log based on status/assignee changes
        workflow: req.workflow.map(step =>
          step.stage === 'Assigned' && editFormData.assignee && !step.completed
            ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
            : step
        ).map(step =>
          step.stage === 'Approved' && editFormData.status === 'Approved' && !step.completed
            ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
            : step
        ).map(step =>
          step.stage === 'Work Started' && editFormData.status === 'In Progress' && !step.completed
            ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
            : step
        ).map(step =>
          step.stage === 'Work Completed' && (editFormData.status === 'Approved' || editFormData.status === 'Resolved') && !step.completed
            ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
            : step
        ),
        auditLog: [...req.auditLog, {
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          action: 'updated request',
          details: 'Fields updated via edit form.',
        }],
      } : req
    );
    data.requests = updatedRequests; // In a real app, this would be an API call

    setShowEditModal(false);
    alert('Request updated successfully!');
    // Force re-render of detail screen
    onNavigate({ screen: 'REQUEST_DETAIL', params: { id: requestId }, refresh: true });
  };

  const handleApprove = () => {
    if (window.confirm(`Are you sure you want to approve Request ID: ${request.id}?`)) {
      const updatedRequests = data.requests.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'Approved',
              updatedAt: new Date().toISOString(),
              workflow: req.workflow.map(step =>
                step.stage === 'Approved' && !step.completed
                  ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
                  : step
              ),
              auditLog: [...req.auditLog, { timestamp: new Date().toISOString(), user: currentUser.name, action: 'approved request', details: 'Request resolution approved.' }],
            }
          : req
      );
      data.requests = updatedRequests;
      alert('Request Approved!');
      onNavigate({ screen: 'REQUEST_DETAIL', params: { id: requestId }, refresh: true });
    }
  };

  const handleReject = () => {
    if (window.confirm(`Are you sure you want to reject Request ID: ${request.id}?`)) {
      const updatedRequests = data.requests.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'Rejected',
              updatedAt: new Date().toISOString(),
              workflow: req.workflow.map(step =>
                step.stage === 'Rejected' && !step.completed
                  ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
                  : step
              ),
              auditLog: [...req.auditLog, { timestamp: new Date().toISOString(), user: currentUser.name, action: 'rejected request', details: 'Request rejected due to invalid scope.' }],
            }
          : req
      );
      data.requests = updatedRequests;
      alert('Request Rejected!');
      onNavigate({ screen: 'REQUEST_DETAIL', params: { id: requestId }, refresh: true });
    }
  };

  const handleAssignSubmit = () => {
    // Logic to assign technician
    alert(`Assigning technician ${editFormData.assignee} to request ${requestId}`);
    const updatedRequests = data.requests.map(req =>
      req.id === requestId ? {
        ...req,
        assignee: editFormData.assignee,
        status: 'In Progress', // Update status if assigned
        updatedAt: new Date().toISOString(),
        workflow: req.workflow.map(step =>
          step.stage === 'Assigned' && !step.completed
            ? { ...step, completed: true, date: new Date().toISOString(), by: currentUser.name }
            : step
        ),
        auditLog: [...req.auditLog, {
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          action: 'assigned technician',
          details: `Assigned to ${editFormData.assignee}.`,
        }],
      } : req
    );
    data.requests = updatedRequests;
    setShowAssignModal(false);
    alert('Technician assigned successfully!');
    onNavigate({ screen: 'REQUEST_DETAIL', params: { id: requestId }, refresh: true });
  };

  const availableTechnicians = data.users
    .filter(u => u.role === ROLES.MAINTENANCE_TECHNICIAN)
    .map(tech => ({ value: tech.name, label: tech.name }));

  const availableCategories = [...new Set(data.requests.map(req => req.category))].map(cat => ({ value: cat, label: cat }));
  const availableAssets = data.assets.map(asset => ({ value: asset.id, label: `${asset.name} (${asset.id})` }));


  const isEditable = permissions.canEditRequest && (request.status !== 'Approved' && request.status !== 'Rejected');
  const isActionable = permissions.canApproveReject && (request.status === 'Pending' || request.status === 'In Progress');
  const canAssign = permissions.canAssignTechnician && request.status === 'Pending';
  const canViewAuditLogs = permissions.canViewAuditLogs || (request.reporter === currentUser.name || request.assignee === currentUser.name);

  return (
    <div className="main-content">
      <Breadcrumbs
        paths={[
          { label: 'Requests', onClick: { screen: 'REQUESTS' } },
          { label: request.title, onClick: { screen: 'REQUEST_DETAIL', params: { id: request.id } } }
        ]}
        onNavigate={onNavigate}
      />

      <div className="detail-header">
        <div className="detail-title-group">
          <h1 className="detail-title">{request.title}</h1>
          <p className="detail-subtitle">ID: {request.id} &bull; Reported by {request.reporter}</p>
          <StatusPill status={request.status} />
        </div>
        <div className="detail-actions">
          {isEditable && (
            <Button onClick={() => setShowEditModal(true)} icon="edit">Edit Request</Button>
          )}
          {canAssign && (
             <Button onClick={() => setShowAssignModal(true)} icon="assign" variant="secondary">Assign Technician</Button>
          )}
          {isActionable && (
            <>
              <Button onClick={handleApprove} icon="check" className="button-primary">Approve</Button>
              <Button onClick={handleReject} icon="cross" className="button-secondary">Reject</Button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column - Record Summary & Milestones */}
        <div>
          <Card className="detail-section-card">
            <h3 className="detail-section-title">Summary</h3>
            <div className="detail-field"><label>Description:</label><span>{request.description}</span></div>
            <div className="detail-field"><label>Category:</label><span>{request.category}</span></div>
            <div className="detail-field"><label>Priority:</label><span>{request.priority}</span></div>
            <div className="detail-field"><label>Location:</label><span>{request.location}</span></div>
            <div className="detail-field"><label>Assignee:</label><span>{request.assignee || 'Not assigned'}</span></div>
            <div className="detail-field"><label>Created At:</label><span>{new Date(request.createdAt).toLocaleString()}</span></div>
            <div className="detail-field"><label>Last Updated:</label><span>{new Date(request.updatedAt).toLocaleString()}</span></div>
          </Card>

          <Card className="detail-section-card">
            <h3 className="detail-section-title">Related Asset</h3>
            {request.assetId ? (
              <>
                <div className="detail-field"><label>Asset ID:</label><span><a href="#" onClick={() => alert('Navigate to Asset Detail')}>{request.assetId}</a></span></div>
                <div className="detail-field"><label>Asset Name:</label><span>{data.assets.find(a => a.id === request.assetId)?.name || 'N/A'}</span></div>
                <div className="detail-field"><label>Asset Health:</label><span>{data.assets.find(a => a.id === request.assetId)?.health || 'N/A'}</span></div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No related asset.</p>
            )}
          </Card>

          {request.files && request.files.length > 0 && (
            <Card className="detail-section-card">
              <h3 className="detail-section-title">Attachments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {request.files.map((file, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span className="icon file"></span> {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

        </div>

        {/* Right Column - Milestone Tracker & Audit Feed */}
        <div>
          <Card className="detail-section-card">
            <h3 className="detail-section-title">Workflow Progress</h3>
            <MilestoneTracker workflow={request.workflow} currentStatus={request.status} slaEnabled={true} />
          </Card>

          {canViewAuditLogs && (
            <Card className="detail-section-card">
              <h3 className="detail-section-title">News & Audit Feed</h3>
              <AuditFeed auditLog={request.auditLog} />
            </Card>
          )}
        </div>
      </div>

      {/* Edit Request Modal */}
      <Modal
        title="Edit Service Request"
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </>
        }
      >
        <Input
          label="Request Title"
          name="title"
          value={editFormData.title || ''}
          onChange={handleEditChange}
          required
          error={editFormErrors.title}
        />
        <TextArea
          label="Description"
          name="description"
          value={editFormData.description || ''}
          onChange={handleEditChange}
          required
          error={editFormErrors.description}
        />
        <Select
          label="Priority"
          name="priority"
          value={editFormData.priority || ''}
          onChange={handleEditChange}
          required
          error={editFormErrors.priority}
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
        />
        <Select
          label="Status"
          name="status"
          value={editFormData.status || ''}
          onChange={handleEditChange}
          required
          error={editFormErrors.status}
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Exception', label: 'Exception' },
          ]}
          disabled={!permissions.canApproveReject && !permissions.canEditRequest} // Status change usually requires specific permissions
        />
        <Select
          label="Category"
          name="category"
          value={editFormData.category || ''}
          onChange={handleEditChange}
          required
          error={editFormErrors.category}
          options={availableCategories}
        />
        <Select
          label="Related Asset (Optional)"
          name="assetId"
          value={editFormData.assetId || ''}
          onChange={handleEditChange}
          options={availableAssets}
        />
        {/* File upload/preview logic would be here, but using placeholder files data for now */}
        {editFormData.files && editFormData.files.length > 0 && (
          <div className="input-group">
            <label>Current Files</label>
            <div className="uploaded-files">
              {editFormData.files.map((file, index) => (
                <div key={index} className="uploaded-file-item">
                  <span><span className="icon file"></span>{file.name}</span>
                  {/* <button onClick={() => handleFileRemove(index)}>Remove</button> */} {/* Implement remove logic if needed */}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        title="Assign Technician"
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssignSubmit}>Assign</Button>
          </>
        }
      >
        <p style={{ marginBottom: 'var(--spacing-md)' }}>Select a technician to assign to this request:</p>
        <Select
          label="Technician"
          name="assignee"
          value={editFormData.assignee || ''} // Use editFormData for convenience
          onChange={handleEditChange}
          required
          options={availableTechnicians}
        />
      </Modal>
    </div>
  );
};

const AssetCard = ({ asset, onClick, currentUser }) => {
  const healthStatus = asset.health;
  let statusClass = '';
  switch (healthStatus) {
    case 'Good': statusClass = 'approved'; break;
    case 'Poor': statusClass = 'pending'; break;
    case 'Critical': statusClass = 'rejected'; break; // Using rejected for critical as it implies negative
    case 'Obsolete': statusClass = 'exception'; break;
    default: statusClass = 'in-progress';
  }

  return (
    <Card onClick={() => onClick(asset.id)} className="asset-card">
      <div className="card-header">
        <h4 className="card-title">{asset.name}</h4>
        <StatusPill status={healthStatus} className={statusClass} />
      </div>
      <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-sm)' }}>ID: {asset.id}</p>
      <div className="card-content">
        <p>Type: {asset.type}</p>
        <p>Location: {asset.location}</p>
      </div>
      <div className="request-card-footer" style={{ marginTop: 'var(--spacing-md)' }}>
        <span>Last Maint: {asset.lastMaintenance}</span>
        <span>Next Maint: {asset.nextMaintenance}</span>
      </div>
    </Card>
  );
};


const AssetListScreen = ({ currentUser, onNavigate, data }) => {
  const permissions = getPermissions(currentUser?.role);
  if (!permissions.canManageAssets) {
    return (
      <div className="main-content">
        <h1>Access Denied</h1>
        <p>You do not have permission to view asset management.</p>
        <Button onClick={() => onNavigate({ screen: 'DASHBOARD' })}>Go to Dashboard</Button>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');

  const filteredAssets = data.assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? asset.type === filterType : true;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    // Add more sort options if needed
    return 0;
  });

  const uniqueAssetTypes = [...new Set(data.assets.map(asset => asset.type))];
  const assetTypeOptions = uniqueAssetTypes.map(type => ({ value: type, label: type }));

  return (
    <div className="main-content">
      <h1 className="detail-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Asset Management</h1>

      <div className="list-controls">
        <div className="list-search">
          <Input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="global-search-input"
            icon="search"
          />
        </div>
        <div className="list-actions">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={assetTypeOptions}
            placeholder="Filter by Type"
            className="select-field"
            style={{ width: '150px' }}
          />
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'name-asc', label: 'Name (A-Z)' },
              { value: 'name-desc', label: 'Name (Z-A)' },
            ]}
            placeholder="Sort by Name"
            className="select-field"
            style={{ width: '150px' }}
          />
          <Button onClick={() => alert('Open Create Asset Modal')} icon="plus">Add New Asset</Button>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="empty-state">
          <img src="https://via.placeholder.com/150/F1F5F9/94A3B8?text=No+Assets" alt="No Assets" />
          <h3 className="empty-state-title">No Assets Found</h3>
          <p className="empty-state-description">It looks like there are no assets matching your criteria.</p>
          <Button onClick={() => alert('Open Create Asset Modal')} icon="plus">Add First Asset</Button>
        </div>
      ) : (
        <div className="request-grid"> {/* Reusing grid styles */}
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={(id) => alert(`Navigate to Asset Detail for ${id}`)}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UserCard = ({ user, onClick, currentUser, onEdit }) => {
  const permissions = getPermissions(currentUser?.role);

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onEdit(user.id);
  };

  return (
    <Card onClick={() => onClick(user.id)} className="request-card" style={{ position: 'relative' }}> {/* Reusing request-card styles */}
      <div className="request-card-info">
        <div className="card-header">
          <h4 className="card-title">{user.name}</h4>
          <StatusPill status={user.role} className={getStatusClass(user.role === ROLES.ADMIN ? 'Approved' : 'In Progress')} /> {/* Mock status for roles */}
        </div>
        <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-sm)' }}>ID: {user.id}</p>
        <p className="card-content">Email: {user.email}</p>
      </div>
      {permissions.canManageUsers && (
        <div className="request-card-hover-actions">
          <Button variant="secondary" icon="edit" onClick={handleEditClick}>Edit</Button>
        </div>
      )}
    </Card>
  );
};

const UserManagementScreen = ({ currentUser, onNavigate, data }) => {
  const permissions = getPermissions(currentUser?.role);
  if (!permissions.canManageUsers) {
    return (
      <div className="main-content">
        <h1>Access Denied</h1>
        <p>You do not have permission to manage users.</p>
        <Button onClick={() => onNavigate({ screen: 'DASHBOARD' })}>Go to Dashboard</Button>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(Object.values(ROLES))];
  const roleOptions = uniqueRoles.map(role => ({ value: role, label: role }));

  const handleEditUser = (userId) => {
    alert(`Open edit user form for user ID: ${userId} (Role-based field security and record-level security apply)`);
  };

  return (
    <div className="main-content">
      <h1 className="detail-title" style={{ marginBottom: 'var(--spacing-lg)' }}>User Management</h1>

      <div className="list-controls">
        <div className="list-search">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="global-search-input"
            icon="search"
          />
        </div>
        <div className="list-actions">
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={roleOptions}
            placeholder="Filter by Role"
            className="select-field"
            style={{ width: '150px' }}
          />
          <Button onClick={() => alert('Open Create New User Modal')} icon="plus">Add New User</Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <img src="https://via.placeholder.com/150/F1F5F9/94A3B8?text=No+Users" alt="No Users" />
          <h3 className="empty-state-title">No Users Found</h3>
          <p className="empty-state-description">It looks like there are no users matching your criteria.</p>
          <Button onClick={() => alert('Open Create New User Modal')} icon="plus">Add First User</Button>
        </div>
      ) : (
        <div className="request-grid"> {/* Reusing grid styles */}
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onClick={(id) => alert(`Navigate to User Detail for ${id}`)}
              currentUser={currentUser}
              onEdit={handleEditUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main App Component ---
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  // Simulating a logged-in user, can switch roles for testing RBAC
  const [currentUser] = useState(SAMPLE_DATA.users.find(u => u.role === ROLES.ADMIN)); // Current user for session

  // Centralized Navigation Handler
  const handleNavigate = (newView) => {
    setView(currentView => {
      // If refresh is true, force a state update even if screen/params are same
      if (newView.refresh) {
        return { ...newView, refresh: undefined }; // Clear refresh flag
      }
      return newView;
    });
  };

  const handleGlobalSearch = (searchTerm) => {
    // Implement global search logic here.
    // For now, it could navigate to a search results page or filter existing lists.
    console.log("Global search initiated for:", searchTerm);
    // Example: navigate to requests list with search term pre-filled
    if (searchTerm) {
      handleNavigate({ screen: 'REQUESTS', params: { searchTerm } });
    }
  };


  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} data={SAMPLE_DATA} />;
      case 'REQUESTS':
        return <RequestListScreen currentUser={currentUser} onNavigate={handleNavigate} data={SAMPLE_DATA} routeParams={view.params} />;
      case 'REQUEST_DETAIL':
        return <RequestDetailScreen currentUser={currentUser} onNavigate={handleNavigate} data={SAMPLE_DATA} requestId={view.params?.id} />;
      case 'ASSETS':
        return <AssetListScreen currentUser={currentUser} onNavigate={handleNavigate} data={SAMPLE_DATA} />;
      case 'USERS':
        return <UserManagementScreen currentUser={currentUser} onNavigate={handleNavigate} data={SAMPLE_DATA} />;
      default:
        return (
          <div className="main-content">
            <h1>404 - Page Not Found</h1>
            <p>The screen you are trying to access does not exist.</p>
            <Button onClick={() => handleNavigate({ screen: 'DASHBOARD' })}>Go to Dashboard</Button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Header currentUser={currentUser} onNavigate={handleNavigate} onSearch={handleGlobalSearch} />
      {renderScreen()}
    </div>
  );
}

export default App;