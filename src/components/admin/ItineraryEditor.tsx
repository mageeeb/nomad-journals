import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ItineraryStep {
  id?: string;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  images: string[];
  location: string;
  budget?: number;
  tips: string;
}

interface ItineraryEditorProps {
  postId: string;
  onBack: () => void;
  onSaved: () => void;
}

export const ItineraryEditor: React.FC<ItineraryEditorProps> = ({ postId, onBack, onSaved }) => {
  const [steps, setSteps] = useState<ItineraryStep[]>([]);
  const [practicalInfo, setPracticalInfo] = useState('');
  const [budgetInfo, setBudgetInfo] = useState('');
  const [transportInfo, setTransportInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItinerary();
  }, [postId]);

  const loadItinerary = async () => {
    setLoading(true);
    try {
      // Charger les étapes d'itinéraire
      const { data: stepsData, error: stepsError } = await supabase
        .from('itinerary_steps')
        .select('*')
        .eq('post_id', postId)
        .order('day_number');

      if (stepsError) throw stepsError;

      setSteps(stepsData?.map(step => ({
        id: step.id,
        day_number: step.day_number,
        title: step.title,
        description: step.description || '',
        activities: Array.isArray(step.activities) ? step.activities.map(a => String(a)) : [],
        images: step.images || [],
        location: step.location || '',
        budget: step.budget,
        tips: step.tips || ''
      })) || []);

      // Charger les infos pratiques depuis la table posts
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('practical_info, budget_info, transport_info')
        .eq('id', postId)
        .single();

      if (postError && postError.code !== 'PGRST116') throw postError;

      if (postData) {
        setPracticalInfo(typeof postData.practical_info === 'string' ? postData.practical_info : '');
        setBudgetInfo(typeof postData.budget_info === 'string' ? postData.budget_info : '');
        setTransportInfo(typeof postData.transport_info === 'string' ? postData.transport_info : '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'itinéraire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'itinéraire",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newStep: ItineraryStep = {
      day_number: steps.length + 1,
      title: `Jour ${steps.length + 1}`,
      description: '',
      activities: [''],
      images: [],
      location: '',
      tips: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Réorganiser les numéros de jour
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      day_number: i + 1
    }));
    setSteps(reorderedSteps);
  };

  const updateStep = (index: number, field: keyof ItineraryStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addActivity = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].activities.push('');
    setSteps(newSteps);
  };

  const updateActivity = (stepIndex: number, activityIndex: number, value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].activities[activityIndex] = value;
    setSteps(newSteps);
  };

  const removeActivity = (stepIndex: number, activityIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].activities = newSteps[stepIndex].activities.filter((_, i) => i !== activityIndex);
    setSteps(newSteps);
  };

  const saveItinerary = async () => {
    setSaving(true);
    try {
      // Supprimer les anciennes étapes
      await supabase
        .from('itinerary_steps')
        .delete()
        .eq('post_id', postId);

      // Sauvegarder les nouvelles étapes
      if (steps.length > 0) {
        const stepsToInsert = steps.map(step => ({
          post_id: postId,
          day_number: step.day_number,
          title: step.title,
          description: step.description,
          activities: step.activities.filter(a => a.trim() !== ''),
          images: step.images,
          location: step.location,
          budget: step.budget,
          tips: step.tips
        }));

        const { error: stepsError } = await supabase
          .from('itinerary_steps')
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      // Mettre à jour les infos pratiques
      const { error: postError } = await supabase
        .from('posts')
        .update({
          practical_info: practicalInfo,
          budget_info: budgetInfo,
          transport_info: transportInfo
        })
        .eq('id', postId);

      if (postError) throw postError;

      toast({
        title: "Succès",
        description: "Itinéraire sauvegardé avec succès"
      });

      onSaved();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'itinéraire",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement de l'itinéraire...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold">Éditeur d'itinéraire</h2>
      </div>

      {/* Étapes de l'itinéraire */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes de l'itinéraire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, stepIndex) => (
            <Card key={stepIndex} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Jour {step.day_number}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStep(stepIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`title-${stepIndex}`}>Titre</Label>
                  <Input
                    id={`title-${stepIndex}`}
                    value={step.title}
                    onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                    placeholder="Ex: Grande-Terre : Saint-François"
                  />
                </div>

                <div>
                  <Label htmlFor={`location-${stepIndex}`}>Lieu</Label>
                  <Input
                    id={`location-${stepIndex}`}
                    value={step.location}
                    onChange={(e) => updateStep(stepIndex, 'location', e.target.value)}
                    placeholder="Ex: Saint-François, Guadeloupe"
                  />
                </div>

                <div>
                  <Label htmlFor={`description-${stepIndex}`}>Description</Label>
                  <Textarea
                    id={`description-${stepIndex}`}
                    value={step.description}
                    onChange={(e) => updateStep(stepIndex, 'description', e.target.value)}
                    placeholder="Description générale de la journée"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Activités</Label>
                  {step.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex gap-2 mt-2">
                      <Input
                        value={activity}
                        onChange={(e) => updateActivity(stepIndex, activityIndex, e.target.value)}
                        placeholder="Ex: Lever de soleil à La Pointe des Châteaux"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeActivity(stepIndex, activityIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addActivity(stepIndex)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une activité
                  </Button>
                </div>

                <div>
                  <Label htmlFor={`budget-${stepIndex}`}>Budget (€)</Label>
                  <Input
                    id={`budget-${stepIndex}`}
                    type="number"
                    value={step.budget || ''}
                    onChange={(e) => updateStep(stepIndex, 'budget', parseFloat(e.target.value) || null)}
                    placeholder="Budget approximatif pour cette journée"
                  />
                </div>

                <div>
                  <RichTextEditor
                    id={`tips-${stepIndex}`}
                    value={step.tips}
                    onChange={(value) => updateStep(stepIndex, 'tips', value)}
                    placeholder="Conseils pratiques pour cette journée"
                    label="Conseils"
                  />
                </div>

                <div>
                  <Label>Images de l'étape</Label>
                  {step.images.map((imageUrl, imageIndex) => (
                    <div key={imageIndex} className="flex items-center gap-2 mt-2">
                      <img src={imageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newImages = step.images.filter((_, i) => i !== imageIndex);
                          updateStep(stepIndex, 'images', newImages);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <ImageUpload
                    onImageUploaded={(url) => {
                      const newImages = [...step.images, url];
                      updateStep(stepIndex, 'images', newImages);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addStep} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une étape
          </Button>
        </CardContent>
      </Card>

      {/* Informations pratiques */}
      <Card>
        <CardHeader>
          <CardTitle>Informations pratiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <RichTextEditor
              id="practical-info"
              value={practicalInfo}
              onChange={setPracticalInfo}
              placeholder="Conseils généraux, que emporter, meilleures périodes, etc."
              label="Conseils pratiques"
            />
          </div>

          <div>
            <RichTextEditor
              id="budget-info"
              value={budgetInfo}
              onChange={setBudgetInfo}
              placeholder="Budget total, répartition des coûts, conseils d'économie, etc."
              label="Informations budget"
            />
          </div>

          <div>
            <RichTextEditor
              id="transport-info"
              value={transportInfo}
              onChange={setTransportInfo}
              placeholder="Comment se déplacer, location de voiture, transports en commun, etc."
              label="Informations transport"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveItinerary} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder l\'itinéraire'}
        </Button>
      </div>
    </div>
  );
};