export const PROJECT_TYPES = [
  { value: 'BIG',   label: 'Big Project'   },
  { value: 'SMALL', label: 'Small Project' },
]

export const PROJECT_STATUSES_LIST = [
  { value: 'PLANNING',    label: 'Planning'    },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD',     label: 'On Hold'     },
  { value: 'COMPLETED',   label: 'Completed'   },
  { value: 'REWORK',      label: 'Rework'      },
  { value: 'CANCELLED',   label: 'Cancelled'   },
]

export const TASK_STATUSES = [
  { value: 'ASSIGNED',         label: 'Assigned'         },
  { value: 'IN_PROGRESS',      label: 'In Progress'      },
  { value: 'UNDER_REVIEW',     label: 'Under Review'     },
  { value: 'REWORK_REQUESTED', label: 'Rework Requested' },
  { value: 'COMPLETED',        label: 'Completed'        },
]

export const PRIORITIES = [
  { value: 'LOW',    label: 'Low'    },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High'   },
  { value: 'URGENT', label: 'Urgent' },
]

export const DEPARTMENTS = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'it', label: 'Information Technology' },
  { value: 'operations', label: 'Operations' },
]

export const DESIGNATIONS = [
  { value: 'architect', label: 'Architect' },
  { value: 'senior_architect', label: 'Senior Architect' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'site_engineer', label: 'Site Engineer' },
  { value: 'structural_engineer', label: 'Structural Engineer' },
  { value: 'interior_designer', label: 'Interior Designer' },
  { value: 'draftsman', label: 'Draftsman' },
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'admin', label: 'Administrator' },
]

export const PROJECT_CATEGORIES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'interior', label: 'Interior Design' },
]

export const ROLE_BADGE: Record<string, string> = {
  admin:           'bg-[#6B7F3A] text-white',
  project_manager: 'bg-blue-600 text-white',
  hr:              'bg-purple-600 text-white',
  employee:        'bg-[#8BAF5A] text-white',
  site_person:     'bg-orange-500 text-white',
}

export const ROLE_LABEL: Record<string, string> = {
  admin:           'Admin',
  project_manager: 'Project Manager',
  hr:              'HR',
  employee:        'Employee',
  site_person:     'Site Person',
}

export const ALL_ROLES = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Project Manager', value: 'PROJECT_MANAGER' },
  { label: 'HR', value: 'HR' },
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Site Person', value: 'SITE_PERSON' },
]

export const AVAILABLE_SKILLS = [
  { label: '2D Design', value: 'TWO_D_DESIGN' },
  { label: '3D Design', value: 'THREE_D_DESIGN' },
  { label: 'Planning', value: 'PLANNING' },
  { label: 'Estimation', value: 'ESTIMATION' },
  { label: 'Interior Design', value: 'INTERIOR_DESIGN' },
  { label: 'Exterior Design', value: 'EXTERIOR_DESIGN' },
  { label: 'Structural Drawing', value: 'STRUCTURAL_DRAWING' },
  { label: 'AutoCAD', value: 'AUTOCAD' },
  { label: 'Revit', value: 'REVIT' },
  { label: 'SketchUp', value: 'SKETCHUP' },
  { label: 'Site Supervision', value: 'SITE_SUPERVISION' },
  { label: 'Client Handling', value: 'CLIENT_HANDLING' },
  { label: 'Other', value: 'OTHER' },
]

export const GENDER_OPTIONS = [
  { label: 'Male',   value: 'MALE'   },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other',  value: 'OTHER'  },
]
