from django.db import models

class Patient(models.Model):
    patient_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.patient_id

class MRIImage(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='images')
    image_path = models.CharField(max_length=500)
    mask_path = models.CharField(max_length=500)
    mask = models.IntegerField()  # 0 or 1
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.patient.patient_id} - {self.image_path}"