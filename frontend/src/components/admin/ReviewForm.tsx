import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Subject, GradeLevel } from '../../types';

interface ReviewFormProps {
  curriculum?: any | null; // Can be either full Curriculum or partial admin data
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  publisher: string;
  description: string;
  imageUrl: string;
  gradeLevelId: string;
  targetAgeGradeRating: number;
  teachingApproachStyle: string;
  teachingApproachDescription: string;
  teachingApproachRating: number;
  subjectIds: string[];
  subjectComprehensiveness: number;
  subjectsCoveredRating: number;
  materialsComponents: string[];
  materialsCompleteness: number;
  materialsIncludedRating: number;
  instructionStyleType: string;
  instructionSupportLevel: number;
  instructionStyleRating: number;
  timeCommitmentDailyMinutes: number;
  timeCommitmentWeeklyHours: number;
  timeCommitmentFlexibility: number;
  timeCommitmentRating: number;
  costPriceRange: string;
  costValue: number;
  costRating: number;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  availabilityInPrint: boolean;
  availabilityDigital: boolean;
  availabilityUsedMarket: boolean;
  availabilityRating: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ curriculum, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    publisher: '',
    description: '',
    imageUrl: '',
    gradeLevelId: '',
    targetAgeGradeRating: 0,
    teachingApproachStyle: '',
    teachingApproachDescription: '',
    teachingApproachRating: 0,
    subjectIds: [],
    subjectComprehensiveness: 0,
    subjectsCoveredRating: 0,
    materialsComponents: [],
    materialsCompleteness: 0,
    materialsIncludedRating: 0,
    instructionStyleType: '',
    instructionSupportLevel: 0,
    instructionStyleRating: 0,
    timeCommitmentDailyMinutes: 0,
    timeCommitmentWeeklyHours: 0,
    timeCommitmentFlexibility: 0,
    timeCommitmentRating: 0,
    costPriceRange: '$',
    costValue: 0,
    costRating: 0,
    strengths: [],
    weaknesses: [],
    bestFor: [],
    availabilityInPrint: true,
    availabilityDigital: false,
    availabilityUsedMarket: false,
    availabilityRating: 0
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text input states for arrays
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [bestForText, setBestForText] = useState('');
  const [materialsText, setMaterialsText] = useState('');

  useEffect(() => {
    fetchCategories();
    if (curriculum) {
      // If we have a curriculum ID but limited data, fetch full details
      if (curriculum.id && !curriculum.targetAgeGrade && !curriculum.targetAgeGradeRating) {
        fetchFullCurriculumDetails(curriculum.id);
      } else {
        populateForm(curriculum);
      }
    }
  }, [curriculum]);

  const fetchFullCurriculumDetails = async (curriculumId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/curricula/${curriculumId}`);
      if (response.data.success) {
        populateForm(response.data.data.curriculum);
      } else {
        setError('Failed to load curriculum details');
      }
    } catch (err: any) {
      setError('Failed to load curriculum details');
      console.error('Error fetching curriculum details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setSubjects(response.data.data.subjects);
        setGradeLevels(response.data.data.gradeLevels);
      }
    } catch (err: any) {
      setError('Failed to load categories');
    }
  };

  const populateForm = (curr: any) => {
    console.log('🔍 ReviewForm - Populating form with curriculum data:', curr);
    
    // Handle both nested (from public API) and flat (from admin API) structures
    const isFlat = 'targetAgeGradeRating' in curr;
    console.log('📊 ReviewForm - Data structure is flat:', isFlat);
    
    setFormData({
      name: curr.name,
      publisher: curr.publisher,
      description: curr.description,
      imageUrl: curr.imageUrl || '',
      gradeLevelId: isFlat ? (curr.gradeLevelId || curr.gradeLevel?.id || '') : curr.targetAgeGrade?.gradeLevel?.id || '',
      targetAgeGradeRating: isFlat ? curr.targetAgeGradeRating || 0 : curr.targetAgeGrade?.rating || 0,
      teachingApproachStyle: isFlat ? curr.teachingApproachStyle || '' : curr.teachingApproach?.style || '',
      teachingApproachDescription: isFlat ? curr.teachingApproachDescription || '' : curr.teachingApproach?.description || '',
      teachingApproachRating: isFlat ? curr.teachingApproachRating || 0 : curr.teachingApproach?.rating || 0,
      subjectIds: isFlat ? [] : curr.subjectsCovered?.subjects?.map((s: any) => s.id) || [],
      subjectComprehensiveness: isFlat ? curr.subjectComprehensiveness || 0 : curr.subjectsCovered?.comprehensiveness || 0,
      subjectsCoveredRating: isFlat ? curr.subjectsCoveredRating || 0 : curr.subjectsCovered?.rating || 0,
      materialsComponents: isFlat ? curr.materialsComponents || [] : curr.materialsIncluded?.components || [],
      materialsCompleteness: isFlat ? curr.materialsCompleteness || 0 : curr.materialsIncluded?.completeness || 0,
      materialsIncludedRating: isFlat ? curr.materialsIncludedRating || 0 : curr.materialsIncluded?.rating || 0,
      instructionStyleType: isFlat ? curr.instructionStyleType || '' : curr.instructionStyle?.type || '',
      instructionSupportLevel: isFlat ? curr.instructionSupportLevel || 0 : curr.instructionStyle?.supportLevel || 0,
      instructionStyleRating: isFlat ? curr.instructionStyleRating || 0 : curr.instructionStyle?.rating || 0,
      timeCommitmentDailyMinutes: isFlat ? curr.timeCommitmentDailyMinutes || 0 : curr.timeCommitment?.dailyMinutes || 0,
      timeCommitmentWeeklyHours: isFlat ? curr.timeCommitmentWeeklyHours || 0 : curr.timeCommitment?.weeklyHours || 0,
      timeCommitmentFlexibility: isFlat ? curr.timeCommitmentFlexibility || 0 : curr.timeCommitment?.flexibility || 0,
      timeCommitmentRating: isFlat ? curr.timeCommitmentRating || 0 : curr.timeCommitment?.rating || 0,
      costPriceRange: isFlat ? curr.costPriceRange || '' : curr.cost?.priceRange || '',
      costValue: isFlat ? curr.costValue || 0 : curr.cost?.value || 0,
      costRating: isFlat ? curr.costRating || 0 : curr.cost?.rating || 0,
      strengths: curr.strengths || [],
      weaknesses: curr.weaknesses || [],
      bestFor: curr.bestFor || [],
      availabilityInPrint: isFlat ? curr.availabilityInPrint !== false : curr.availability?.inPrint !== false,
      availabilityDigital: isFlat ? curr.availabilityDigital === true : curr.availability?.digitalAvailable === true,
      availabilityUsedMarket: isFlat ? curr.availabilityUsedMarket === true : curr.availability?.usedMarket === true,
      availabilityRating: isFlat ? curr.availabilityRating || 0 : curr.availability?.rating || 0
    });

    // Populate text fields
    setStrengthsText((curr.strengths || []).join(', '));
    setWeaknessesText((curr.weaknesses || []).join(', '));
    setBestForText((curr.bestFor || []).join(', '));
    setMaterialsText((isFlat ? curr.materialsComponents : curr.materialsIncluded?.components || []).join(', '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse array fields from text
      const submitData = {
        ...formData,
        strengths: strengthsText.split(',').map(s => s.trim()).filter(s => s),
        weaknesses: weaknessesText.split(',').map(s => s.trim()).filter(s => s),
        bestFor: bestForText.split(',').map(s => s.trim()).filter(s => s),
        materialsComponents: materialsText.split(',').map(s => s.trim()).filter(s => s)
      };

      if (curriculum) {
        await api.put(`/admin/curricula/${curriculum.id}`, submitData);
      } else {
        await api.post('/admin/curricula', submitData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {curriculum ? 'Edit Curriculum' : 'Add New Curriculum'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curriculum Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher *
              </label>
              <input
                type="text"
                required
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                required
                value={formData.gradeLevelId}
                onChange={(e) => handleInputChange('gradeLevelId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Grade Level</option>
                {(gradeLevels || []).map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name} ({grade.ageRange})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects Covered
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(subjects || []).map(subject => (
                <label key={subject.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Sections */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Ratings & Details</h3>
            
            {/* Target Age/Grade Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Age/Grade Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.targetAgeGradeRating}
                  onChange={(e) => handleInputChange('targetAgeGradeRating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Teaching Approach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Approach Style
                </label>
                <select
                  value={formData.teachingApproachStyle}
                  onChange={(e) => handleInputChange('teachingApproachStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Style</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Charlotte Mason">Charlotte Mason</option>
                  <option value="Unit Studies">Unit Studies</option>
                  <option value="Montessori">Montessori</option>
                  <option value="Waldorf">Waldorf</option>
                  <option value="Eclectic">Eclectic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Approach Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.teachingApproachRating}
                  onChange={(e) => handleInputChange('teachingApproachRating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teaching Approach Description
              </label>
              <textarea
                rows={3}
                value={formData.teachingApproachDescription}
                onChange={(e) => handleInputChange('teachingApproachDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Materials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materials Components (comma-separated)
                </label>
                <input
                  type="text"
                  value={materialsText}
                  onChange={(e) => setMaterialsText(e.target.value)}
                  placeholder="Textbook, Workbook, Teacher Guide, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materials Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.materialsIncludedRating}
                  onChange={(e) => handleInputChange('materialsIncludedRating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cost */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={formData.costPriceRange}
                  onChange={(e) => handleInputChange('costPriceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="$">$ (Under $50)</option>
                  <option value="$$">$$ ($50-$150)</option>
                  <option value="$$$">$$$ ($150-$300)</option>
                  <option value="$$$$">$$$$ (Over $300)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.costValue}
                  onChange={(e) => handleInputChange('costValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.costRating}
                  onChange={(e) => handleInputChange('costRating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Commitment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.timeCommitmentDailyMinutes}
                  onChange={(e) => handleInputChange('timeCommitmentDailyMinutes', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.timeCommitmentWeeklyHours}
                  onChange={(e) => handleInputChange('timeCommitmentWeeklyHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Commitment Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.timeCommitmentRating}
                  onChange={(e) => handleInputChange('timeCommitmentRating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availabilityInPrint}
                    onChange={(e) => handleInputChange('availabilityInPrint', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">In Print</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availabilityDigital}
                    onChange={(e) => handleInputChange('availabilityDigital', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Digital</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availabilityUsedMarket}
                    onChange={(e) => handleInputChange('availabilityUsedMarket', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Used Market</span>
                </label>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.availabilityRating}
                    onChange={(e) => handleInputChange('availabilityRating', parseFloat(e.target.value) || 0)}
                    placeholder="Availability Rating"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Strengths, Weaknesses, Best For */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strengths (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={strengthsText}
                  onChange={(e) => setStrengthsText(e.target.value)}
                  placeholder="Clear instructions, Engaging content, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weaknesses (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={weaknessesText}
                  onChange={(e) => setWeaknessesText(e.target.value)}
                  placeholder="Expensive, Limited support, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best For (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={bestForText}
                  onChange={(e) => setBestForText(e.target.value)}
                  placeholder="Visual learners, Busy families, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : curriculum ? 'Update Curriculum' : 'Create Curriculum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;